<?php

namespace App\Http\Controllers;

use App\Events\SocketMessage;
use App\Http\Requests\StoreMessageRequest;
use App\Http\Resources\MessageResource;
use App\Models\Conversation;
use App\Models\Group;
use App\Models\Message;
use App\Models\MessageAttachment;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Storage;
use Inertia\Inertia;
use Illuminate\Support\Str;

class MessageController extends Controller
{
    public function byUser(User $user){
        $messages = Message::where("sender_id",Auth::user()->id)
            ->where('receiver_id',$user->id)
            ->orWhere('sender_id',$user->id)
            ->where('receiver_id',Auth::user()->id)
            ->latest()
            ->paginate(10);
        return Inertia::render('Home',[
            'selectedConversation' => $user->toConversationArray(),
            'messages' => MessageResource::collection($messages)
        ]);
    }

    public function byGroup(Group $group){
        $messages = Message::where("group_id",$group->id)
            ->latest()
            ->paginate(10);
        
        return inertia('Home',[
            'selectedConversation' => $group->toConversationArray(),
            'messages' => MessageResource::collection($messages)
        ]);
    }

    public function loadOlder(Message $message){
        if($message->group_id){
            $messages = Message::where('created_at','<',$message->created_at)
                ->where('group_id',$message->group_id)
                ->latest()
                ->paginate(10);
        }else{
            $messages = Message::where('created_at','<',$message->created_at)
                ->where(function($query) use($message){
                    $query->where('sender_id',$message->sender_id)
                        ->where('receiver_id',$message->receiver_id)
                        ->orWhere('sender_id',$message->receiver_id)
                        ->where('receiver_id',$message->sender_id);
                })
                ->latest()
                ->paginate(10);
        }

        return MessageResource::collection($messages);
    }

    public function store(StoreMessageRequest $request){
        $data = $request->validated();
        $data['sender_id'] = Auth::user()->id;
        $receiverId = $data['receiver_id'] ?? null;
        $groupId = $data['group_id'] ?? null;

        $files = $data['attachments'] ?? [];
        
        $message = Message::create($data);

        $attachments = [];
        if($files){
            foreach($files as $file){
                $directory = 'attachments/'. Str::random(32);
                Storage::makeDirectory($directory);
                // dd($file->getClientMimeType());
                $model = [
                    'message_id' => $message->id,
                    'name' => $file->getClientOriginalName(),
                    'mime' => $file->getClientMimeType(),
                    'size' => $file->getSize(),
                    'path' => $file->store($directory,'public')
                ];
                $attachment = MessageAttachment::create($model);
                $attachments[] = $attachment;
            }
            $message->attachments = $attachments;
        }

        if($receiverId){
    
            Conversation::updateConversationWithMessage($receiverId,Auth::user()->id,$message);
        }

        if($groupId){
            Group::updateGroupWithMessage($groupId,$message);
        }

        SocketMessage::dispatch($message);
        // dd("hello from controller");
        
        return (new MessageResource($message))->response()->setStatusCode(200);
    }

    public function destroy(Message $message){
        if($message->sender_id !== Auth::user()->id){
            return response()->json(['message' => 'Forbidden',403]);
        }

        $group = null;
        $conversation = null;

        if($message->group_id){
            $group = Group::where('last_message_id',$message->id)->first();
        }else{
            $conversation = Conversation::where('last_message_id',$message->id)->first();
        }

        
        $message->delete();

        $lastMessage = null;
        if($group){
            $group = Group::find($group->id);
            $lastMessage = $group->lastMessage;
        }elseif($conversation){
            $conversation = Conversation::find($conversation->id);
            $lastMessage = $conversation->lastMessage;
        }
        
        return response()->json(['message' =>$lastMessage ? new MessageResource($lastMessage) : null]);
    }
}
