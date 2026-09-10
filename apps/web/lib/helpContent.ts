export type HelpSection = { heading?: string; steps: string[] };
export type HelpContent = { title: string; intro?: string; sections: HelpSection[] };

export const HOME_HELP: HelpContent = {
  title: "WELCOME, PLAYER ONE!",
  intro: "Planning Poker helps your team size up work together — no login required.",
  sections: [
    {
      steps: [
        "Starting a fresh session? Tap HOST A ROOM to set your name, point scale, and story list.",
        "Got a room code from a teammate? Type it into the ROOM CODE box and tap JOIN ROOM.",
        "Codes are short and not case-sensitive — we'll upper-case it for you automatically.",
        "Just pick a name and a pixel avatar when you get there — that's your whole account.",
      ],
    },
  ],
};

export const CREATE_HELP: HelpContent = {
  title: "SETTING UP YOUR ROOM",
  intro: "Fill out these 4 steps to spin up a new estimation session. You'll be the host.",
  sections: [
    {
      heading: "1. NAME & AVATAR",
      steps: ["Enter the name your team will see at the table and pick a pixel avatar to represent you."],
    },
    {
      heading: "2. POINT SCALE",
      steps: [
        "Choose a built-in scale like Modified Fibonacci, or switch to Custom and enter your own comma-separated values (e.g. 1, 2, 3, 5, 8).",
        "This is the deck everyone will vote from — choose it before stories get estimated.",
      ],
    },
    {
      heading: "3. ESTIMATION STAGE",
      steps: [
        "Pick ROUGH for early, high-level sizing of a backlog.",
        "Pick SPRINT PLAN for detailed, sprint-ready estimates.",
        "This just labels the session for your team — it doesn't change how voting works.",
      ],
    },
    {
      heading: "4. STORY QUEUE",
      steps: [
        "Add the stories or tickets you want the team to estimate, in the order you want to run them.",
        "Don't worry about getting the list perfect — you and your team can add more stories once the room is live.",
      ],
    },
    {
      heading: "READY?",
      steps: [
        "Tap CREATE ROOM. You'll land in the room as host, holding the host token that unlocks REVEAL, FINALIZE, and team-management controls.",
      ],
    },
  ],
};

export const ROOM_JOIN_HELP: HelpContent = {
  title: "JOINING THIS ROOM",
  sections: [
    {
      steps: [
        "Enter the name your teammates will see next to your cards.",
        "Pick a pixel avatar — purely cosmetic, change it any time by rejoining.",
        "Tap JOIN to take your seat at the table.",
        "If you were previously removed by the host, you'll see a notice here — just rejoin with a name to hop back in.",
      ],
    },
  ],
};

export const ROOM_HELP_PARTICIPANT: HelpContent = {
  title: "HOW TO PLAY",
  sections: [
    {
      heading: "VOTING ON A STORY",
      steps: [
        "When a story is active, drag the RISK / COMPLEXITY / REPETITION sliders to reflect your gut read on the work.",
        "Pick a point card from the deck below the sliders.",
        "Tap SUBMIT VOTE. Your card stays hidden from everyone else until reveal.",
      ],
    },
    {
      heading: "WAITING & REVEAL",
      steps: [
        'After submitting, you\'ll see "Vote submitted — waiting for others."',
        "Once the host reveals, everyone's point cards appear. Hover or tap a card's point value to see that person's factor gauges.",
        "A green banner means consensus; a yellow banner means votes differed — expect some team discussion.",
      ],
    },
    {
      heading: "RE-VOTES & QUEUE",
      steps: [
        "If the host starts a re-vote, your sliders and card selection reset — vote again fresh.",
        "You can add stories to the STORY QUEUE yourself, but only the host can start one.",
        "Finalized stories with their agreed points show up under SESSION HISTORY.",
      ],
    },
  ],
};

export const ROOM_HELP_HOST: HelpContent = {
  title: "RUNNING THIS ROOM",
  intro: "You're the host — everything a participant can do, plus these controls:",
  sections: [
    {
      heading: "RUNNING A ROUND",
      steps: [
        "In STORY QUEUE, tap START on a story to open voting for it.",
        "Tap REVEAL CARDS once your team has voted. If someone hasn't submitted yet, this instead nudges them with a taunt on the team list — tap REVEAL ANYWAY to reveal regardless.",
        "After reveal, pick the point in the dropdown (we suggest the consensus or nearest-average value) and tap FINALIZE STORY to lock it into history and clear the board.",
        "No consensus and want another round first? Tap START RE-VOTE instead of finalizing.",
      ],
    },
    {
      heading: "MANAGING THE TEAM",
      steps: [
        "In the TEAM panel, you can transfer host powers to another member — useful if you need to step away.",
        "You can also remove a member, e.g. if they're idle or disconnected.",
      ],
    },
    {
      heading: "MANAGING THE QUEUE",
      steps: [
        "Add or remove stories from STORY QUEUE at any time, even mid-session.",
        "The queue persists across rounds, so you can queue up the whole backlog up front.",
      ],
    },
    {
      heading: "GOOD TO KNOW",
      steps: [
        "Your host token is saved in this browser. Reopening this room's link keeps your host powers — clearing site data will lose them.",
      ],
    },
  ],
};
