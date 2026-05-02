import type React from "react";
import { createContext, useContext, useState } from "react";
import { useLocalStorage } from "@/features/calendar/hooks";
import type { IUser } from "@/features/calendar/interfaces";
import type { TCalendarView } from "@/features/calendar/types";
import type { Task, Type } from "@/types/types";

interface ICalendarContext {
  selectedDate: Date;
  view: TCalendarView;
  setView: (view: TCalendarView) => void;
  agendaModeGroupBy: "date" | "type";
  setAgendaModeGroupBy: (groupBy: "date" | "type") => void;
  use24HourFormat: boolean;
  toggleTimeFormat: () => void;
  setSelectedDate: (date: Date | undefined) => void;
  selectedUserId: string | "all";
  setSelectedUserId: (userId: string | "all") => void;
  badgeVariant: "dot" | "colored";
  setBadgeVariant: (variant: "dot" | "colored") => void;
  selectedTypes: Type[];
  filterEventsBySelectedTypes: (type: Type) => void;
  filterEventsBySelectedUser: (userId: string | "all") => void;
  users: IUser[];
  events: Task[];
  addEvent: (event: Task) => void;
  updateEvent: (event: Task) => void;
  removeEvent: (eventId: number) => void;
  clearFilter: () => void;
}

interface CalendarSettings {
  badgeVariant: "dot" | "colored";
  view: TCalendarView;
  use24HourFormat: boolean;
  agendaModeGroupBy: "date" | "type";
}

const DEFAULT_SETTINGS: CalendarSettings = {
  badgeVariant: "colored",
  view: "day",
  use24HourFormat: true,
  agendaModeGroupBy: "date",
};

const CalendarContext = createContext({} as ICalendarContext);

export function CalendarProvider({
  children,
  users,
  events,
  badge = "colored",
  view = "day",
}: {
  children: React.ReactNode;
  users: IUser[];
  events: Task[];
  view?: TCalendarView;
  badge?: "dot" | "colored";
}) {
  const [settings, setSettings] = useLocalStorage<CalendarSettings>(
    "calendar-settings",
    {
      ...DEFAULT_SETTINGS,
      badgeVariant: badge,
      view: view,
    },
  );

  const [badgeVariant, setBadgeVariantState] = useState<"dot" | "colored">(
    settings.badgeVariant,
  );
  const [currentView, setCurrentViewState] = useState<TCalendarView>(
    settings.view,
  );
  const [use24HourFormat, setUse24HourFormatState] = useState<boolean>(
    settings.use24HourFormat,
  );
  const [agendaModeGroupBy, setAgendaModeGroupByState] = useState<
    "date" | "type"
  >(settings.agendaModeGroupBy);

  const [selectedDate, setSelectedDate] = useState(new Date());
  const [selectedUserId, setSelectedUserId] = useState<string | "all">("all");
  const [selectedTypes, setSelectedTypes] = useState<Type[]>([]);

  const [allEvents, setAllEvents] = useState<Task[]>(events || []);
  const [filteredEvents, setFilteredEvents] = useState<Task[]>(events || []);

  const updateSettings = (newPartialSettings: Partial<CalendarSettings>) => {
    setSettings({
      ...settings,
      ...newPartialSettings,
    });
  };

  const setBadgeVariant = (variant: "dot" | "colored") => {
    setBadgeVariantState(variant);
    updateSettings({ badgeVariant: variant });
  };

  const setView = (newView: TCalendarView) => {
    setCurrentViewState(newView);
    updateSettings({ view: newView });
  };

  const toggleTimeFormat = () => {
    const newValue = !use24HourFormat;
    setUse24HourFormatState(newValue);
    updateSettings({ use24HourFormat: newValue });
  };

  const setAgendaModeGroupBy = (groupBy: "date" | "type") => {
    setAgendaModeGroupByState(groupBy);
    updateSettings({ agendaModeGroupBy: groupBy });
  };

  const filterEventsBySelectedTypes = (type: Type) => {
    const isTypeSelected = selectedTypes.includes(type);
    const newTypes = isTypeSelected
      ? selectedTypes.filter((t) => t !== type)
      : [...selectedTypes, type];

    if (newTypes.length > 0) {
      const filtered = allEvents.filter((event) => {
        const eventType = event.Type;
        return newTypes.includes(eventType);
      });
      setFilteredEvents(filtered);
    } else {
      setFilteredEvents(allEvents);
    }

    setSelectedTypes(newTypes);
  };

  const filterEventsBySelectedUser = (userId: string | "all") => {
    setSelectedUserId(userId);
    if (userId === "all") {
      setFilteredEvents(allEvents);
    } else {
      const filtered = allEvents.filter((event) => event.Assignee === userId);
      setFilteredEvents(filtered);
    }
  };

  const handleSelectDate = (date: Date | undefined) => {
    if (!date) return;
    setSelectedDate(date);
  };

  const addEvent = (event: Task) => {
    setAllEvents((prev) => [...prev, event]);
    setFilteredEvents((prev) => [...prev, event]);
  };

  const updateEvent = (event: Task) => {
    const updated = {
      ...event,
      TimePlannedStart: event.TimePlannedStart
        ? new Date(event.TimePlannedStart).toISOString()
        : event.TimeCreated,
      TimePlannedEnd: event.TimePlannedEnd
        ? new Date(event.TimePlannedEnd).toISOString()
        : event.TimePlannedStart,
    };

    setAllEvents((prev) => prev.map((e) => (e.ID === event.ID ? updated : e)));
    setFilteredEvents((prev) =>
      prev.map((e) => (e.ID === event.ID ? updated : e)),
    );
  };

  const removeEvent = (eventId: number) => {
    setAllEvents((prev) => prev.filter((e) => e.ID !== eventId));
    setFilteredEvents((prev) => prev.filter((e) => e.ID !== eventId));
  };

  const clearFilter = () => {
    setFilteredEvents(allEvents);
    setSelectedTypes([]);
    setSelectedUserId("all");
  };

  const value = {
    selectedDate,
    setSelectedDate: handleSelectDate,
    selectedUserId,
    setSelectedUserId,
    badgeVariant,
    setBadgeVariant,
    users,
    selectedTypes,
    filterEventsBySelectedTypes,
    filterEventsBySelectedUser,
    events: filteredEvents,
    view: currentView,
    use24HourFormat,
    toggleTimeFormat,
    setView,
    agendaModeGroupBy,
    setAgendaModeGroupBy,
    addEvent,
    updateEvent,
    removeEvent,
    clearFilter,
  };

  return (
    <CalendarContext.Provider value={value}>
      {children}
    </CalendarContext.Provider>
  );
}

export function useCalendar(): ICalendarContext {
  const context = useContext(CalendarContext);
  if (!context)
    throw new Error("useCalendar must be used within a CalendarProvider.");
  return context;
}
