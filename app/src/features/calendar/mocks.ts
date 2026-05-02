import type { Task, Type, Priority, Status, Value } from "@/types/types";
import type { IUser } from "@/features/calendar/interfaces";

export const USERS_MOCK: IUser[] = [
  {
    id: "f3b035ac-49f7-4e92-a715-35680bf63175",
    name: "Michael Doe",
    picturePath: null,
  },
  {
    id: "3e36ea6e-78f3-40dd-ab8c-a6c737c3c422",
    name: "Alice Johnson",
    picturePath: null,
  },
  {
    id: "a7aff6bd-a50a-4d6a-ab57-76f76bb27cf5",
    name: "Robert Smith",
    picturePath: null,
  },
  {
    id: "dd503cf9-6c38-43cf-94cc-0d4032e2f77a",
    name: "Emily Davis",
    picturePath: null,
  },
];

// ================================== //

const events = [
  "Doctor's appointment",
  "Dental cleaning",
  "Eye exam",
  "Therapy session",
  "Business meeting",
  "Team stand-up",
  "Project deadline",
  "Weekly report submission",
  "Client presentation",
  "Marketing strategy review",
  "Networking event",
  "Sales call",
  "Investor pitch",
  "Board meeting",
  "Employee training",
  "Performance review",
  "One-on-one meeting",
  "Lunch with a colleague",
  "HR interview",
  "Conference call",
  "Web development sprint planning",
  "Software deployment",
  "Code review",
  "QA testing session",
  "Cybersecurity audit",
  "Server maintenance",
  "API integration update",
  "Data backup",
  "Cloud migration",
  "System upgrade",
  "Content planning session",
  "Product launch",
  "Customer support review",
  "Team building activity",
  "Legal consultation",
  "Budget review",
  "Financial planning session",
  "Tax filing deadline",
  "Investor relations update",
  "Partnership negotiation",
  "Medical check-up",
  "Vaccination appointment",
  "Blood donation",
  "Gym workout",
  "Yoga class",
  "Physical therapy session",
  "Nutrition consultation",
  "Personal trainer session",
  "Parent-teacher meeting",
  "School open house",
  "College application deadline",
  "Final exam",
  "Graduation ceremony",
  "Job interview",
  "Internship orientation",
  "Office relocation",
  "Business trip",
  "Flight departure",
  "Hotel check-in",
  "Vacation planning",
  "Birthday party",
  "Wedding anniversary",
  "Family reunion",
  "Housewarming party",
  "Community volunteer work",
  "Charity fundraiser",
  "Religious service",
  "Concert attendance",
  "Theater play",
  "Movie night",
  "Sporting event",
  "Football match",
  "Basketball game",
  "Tennis practice",
  "Marathon training",
  "Cycling event",
  "Fishing trip",
  "Camping weekend",
  "Hiking expedition",
  "Photography session",
  "Art workshop",
  "Cooking class",
  "Book club meeting",
  "Grocery shopping",
  "Car maintenance",
  "Home renovation meeting",
];

const assignees = ["Michael Doe", "Alice Johnson", "Robert Smith", "Emily Davis"];
const types: Type[] = ["Dev", "Reminder", "Test"];
const priorities: Priority[] = ["Urgent", "High", "Medium", "Low"];
const statuses: Status[] = ["Open", "Todo", "Doing", "Blocked", "Done"];

const mockGenerator = (numberOfEvents: number): Task[] => {
  const result: Task[] = [];
  let currentId = 1;

  const now = new Date();
  const startRange = new Date(now);
  startRange.setDate(now.getDate() - 30);
  const endRange = new Date(now);
  endRange.setDate(now.getDate() + 30);

  const currentTime = now.toISOString();
  const currentType = types[Math.floor(Math.random() * types.length)];

  const currentEvent: Task = {
    ID: currentId++,
    Name: events[Math.floor(Math.random() * events.length)],
    Body: "" as Value,
    Checklist: 1,
    TimeCreated: currentTime,
    TimePlannedStart: new Date(now.getTime() - 30 * 60000).toISOString(),
    TimePlannedEnd: new Date(now.getTime() + 30 * 60000).toISOString(),
    TimeCompleted: null,
    Assignee: assignees[Math.floor(Math.random() * assignees.length)],
    Priority: priorities[Math.floor(Math.random() * priorities.length)],
    Type: currentType,
    Status: statuses[Math.floor(Math.random() * statuses.length)],
  };

  result.push(currentEvent);

  for (let i = 0; i < numberOfEvents - 1; i++) {
    const isMultiDay = Math.random() < 0.1;

    const startDate = new Date(
      startRange.getTime() +
        Math.random() * (endRange.getTime() - startRange.getTime()),
    );

    startDate.setHours(
      8 + Math.floor(Math.random() * 12),
      Math.floor(Math.random() * 60),
      0,
      0,
    );

    const endDate = new Date(startDate);

    if (isMultiDay) {
      const additionalDays = Math.floor(Math.random() * 4) + 1;
      endDate.setDate(startDate.getDate() + additionalDays);
      endDate.setHours(
        8 + Math.floor(Math.random() * 12),
        Math.floor(Math.random() * 60),
        0,
        0,
      );
    } else {
      endDate.setHours(endDate.getHours() + Math.floor(Math.random() * 3) + 1);
    }

    const eventType = types[Math.floor(Math.random() * types.length)];

    result.push({
      ID: currentId++,
      Name: events[Math.floor(Math.random() * events.length)],
      Body: "" as Value,
      Checklist: 1,
      TimeCreated: startDate.toISOString(),
      TimePlannedStart: startDate.toISOString(),
      TimePlannedEnd: endDate.toISOString(),
      TimeCompleted: Math.random() > 0.7 ? endDate.toISOString() : null,
      Assignee: assignees[Math.floor(Math.random() * assignees.length)],
      Priority: priorities[Math.floor(Math.random() * priorities.length)],
      Type: eventType,
      Status: statuses[Math.floor(Math.random() * statuses.length)],
    });
  }

  return result;
};

export const CALENDAR_ITEMS_MOCK: Task[] = mockGenerator(80);
