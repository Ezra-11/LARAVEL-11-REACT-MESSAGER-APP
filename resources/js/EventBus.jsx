import React from "react";

export const EventBusContext = React.createContext();

export function EventBusProvider({ children }) {
    const [events, setEvents] = React.useState({});

    function emit(name, data) {
        if (events[name]) {
            for (let cb of events[name]) {
                cb(data);
            }
        }
    }

    function on(name, cb) {
        if (!events[name]) {
            events[name] = [];
        }

        events[name].push(cb);

        return () => {
            events[name] = events[name].filter((callback) => callback !== cb);
        };
    }

    return (
        <EventBusContext.Provider value={{ emit, on }}>
            {children}
        </EventBusContext.Provider>
    );
}

export const useEventBus = () => {
    return React.useContext(EventBusContext);
};
