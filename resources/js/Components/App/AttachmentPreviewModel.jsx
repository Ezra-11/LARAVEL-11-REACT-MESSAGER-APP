import { isAudio, isImage, isPDF, isPreviewable, isVideo } from "@/helpers";
import { Dialog, Transition, TransitionChild } from "@headlessui/react";
import {
    ChevronLeftIcon,
    ChevronRightIcon,
    PaperClipIcon,
    XMarkIcon,
} from "@heroicons/react/24/solid";
import { Fragment, useEffect, useMemo, useState } from "react";

export default function AttachmentPreviewModel({
    attachments,
    index,
    show = false,
    onClose = () => {},
}) {
    const [currentIndex, setCurrentIndex] = useState(0);

    const previewableAttachments = useMemo(() => {
        return attachments.filter((attachment) => isPreviewable(attachment));
    }, [attachments]);

    const attachment = useMemo(() => {
        return previewableAttachments[currentIndex];
    }, [attachments, currentIndex]);

    function close() {
        onClose();
    }

    function prev() {
        if (currentIndex === 0) {
            return;
        }
        setCurrentIndex(currentIndex - 1);
    }

    function next() {
        if (currentIndex === previewableAttachments.length - 1) {
            return;
        }
        setCurrentIndex(currentIndex + 1);
    }

    useEffect(() => {
        setCurrentIndex(index);
    }, [index]);

    return (
        <Transition show={show} as={Fragment} leave="duration-200">
            <Dialog
                as="div"
                id="modal"
                className="relative z-50"
                // open={show}
                onClose={close}
            >
                <TransitionChild
                    as={Fragment}
                    enter="ease-out duration-300"
                    enterFrom="opacity-0"
                    leave="ease-in duration-200"
                    leaveFrom="opacity-100"
                    leaveTo="opacity-0"
                >
                    <div className="fixed inset-0 bg-black/25" />
                </TransitionChild>

                <div className="fixed inset-0 overflow-y-auto">
                    <div className="h-screen w-screen">
                        <TransitionChild
                            as={Fragment}
                            enter="ease-out duration-300"
                            enterFrom="opacity-0 translate-y-4 sm:translate-y-0 sm:scale-95"
                            enterTo="opacity-100 translate-y-0 sm:scale-100"
                            leave="ease-in duration-200"
                            leaveFrom="opacity-100 translate-y-0 sm:scale-100"
                            leaveTo="opacity-0 translate-y-0 sm:translate-y-0 sm:scale-95"
                        >
                            <div className="flex flex-col w-full h-full transform overflow-hidden bg-slate-800 text-left align-middle shadow-xl transition-all">
                                <button
                                    onClick={close}
                                    className="absolute right-3 top-3 w-10 h-10 rounded-full hover:bg-black/10 transition flex items-center justify-center text-gray-100 z-40"
                                >
                                    <XMarkIcon className="w-6 h-6" />
                                </button>
                                <div>
                                    {currentIndex > 0 && (
                                        <div
                                            onClick={prev}
                                            className="absolute opacity-100 text-gray-100 cursor-pointer flex items-center justify-center w-16 h-16 left-4 top-1/2 -translate-y-1/2 rounded-full bg-black/50 z-30"
                                        >
                                            <ChevronLeftIcon className="w-12" />
                                        </div>
                                    )}
                                    {currentIndex <
                                        previewableAttachments.length - 1 && (
                                        <div
                                            onClick={next}
                                            className="absolute opacity-100 text-gray-100 cursor-pointer flex items-center justify-center w-16 h-16 right-4 top-1/2 -translate-y-1/2 rounded-full bg-black/50 z-30"
                                        >
                                            <ChevronRightIcon className="w-12" />
                                        </div>
                                    )}
                                </div>
                                {attachment && (
                                    <div className="flex items-center justify-center w-full h-full p-3">
                                        {isImage(attachment) && (
                                            <img
                                                src={attachment.url}
                                                alt="image"
                                                className="max-w-full max-h-full"
                                            />
                                        )}

                                        {isVideo(attachment) && (
                                            <div className="flex items-center">
                                                <video
                                                    src={attachment.url}
                                                    controls
                                                    autoPlay
                                                ></video>
                                            </div>
                                        )}

                                        {isAudio(attachment) && (
                                            <div className="relative flex justify-center items-center">
                                                <audio
                                                    src={attachment.url}
                                                    controls
                                                    autoPlay
                                                ></audio>
                                            </div>
                                        )}

                                        {isPDF(attachment) && (
                                            <iframe
                                                src={attachment.url}
                                                className="w-full h-full"
                                            ></iframe>
                                        )}

                                        {!isPreviewable(attachment) && (
                                            <div className="p-32 flex flex-col justify-center items-center text-gray-100">
                                                <PaperClipIcon className="w-10 h-10 mb-3" />
                                                <small>{attachment.name}</small>
                                            </div>
                                        )}
                                    </div>
                                )}
                            </div>
                        </TransitionChild>
                    </div>
                </div>
            </Dialog>
        </Transition>
    );
}
