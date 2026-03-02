// constants/aacData.ts
// Full AAC vocabulary — mirrors the Python desktop seed_data() exactly.

export interface AACCategory {
    id: string;
    name: string;
    color: string;
}

export interface AACButton {
    label: string;
    speech: string;
    icon: string; // emoji or relative asset path like 'assets/icons/toast.png'
    category: string;
}

export const AAC_CATEGORIES: AACCategory[] = [
    { id: 'needs', name: 'Needs', color: '#FFCDD2' },
    { id: 'food', name: 'Food & Drinks', color: '#C8E6C9' },
    { id: 'feelings', name: 'Feelings', color: '#BBDEFB' },
    { id: 'people', name: 'People', color: '#E1BEE7' },
    { id: 'places', name: 'Places', color: '#B2EBF2' },
    { id: 'actions', name: 'Actions', color: '#DCEDC8' },
    { id: 'body', name: 'Body', color: '#FFE0B2' },
    { id: 'questions', name: 'Questions', color: '#F8BBD0' },
    { id: 'responses', name: 'Responses', color: '#FFF9C4' },
    { id: 'school', name: 'School', color: '#CFD8DC' },
    { id: 'health', name: 'Health', color: '#D7CCC8' },
    { id: 'phrases', name: 'Quick Phrases', color: '#FFCCBC' },
];

export const AAC_BUTTONS: AACButton[] = [
    // ── Needs & Requests ─────────────────────────────────────────────────
    { label: 'Hungry', speech: 'I am hungry', icon: '🍔', category: 'needs' },
    { label: 'Thirsty', speech: 'I am thirsty', icon: '🥤', category: 'needs' },
    { label: 'Tired', speech: 'I am tired', icon: '😴', category: 'needs' },
    { label: 'Toilet', speech: 'I need to use the toilet', icon: '🚽', category: 'needs' },
    { label: 'Help', speech: 'I need help', icon: '🙋', category: 'needs' },
    { label: 'More', speech: 'I want more', icon: '➕', category: 'needs' },
    { label: 'Stop', speech: 'Please stop', icon: '🛑', category: 'needs' },
    { label: 'Go Away', speech: 'Please go away', icon: '👋', category: 'needs' },
    { label: 'Pain', speech: 'I am in pain', icon: '😣', category: 'needs' },
    { label: 'Cold', speech: 'I am cold', icon: '🥶', category: 'needs' },
    { label: 'Hot', speech: 'I am hot', icon: '🥵', category: 'needs' },
    { label: 'Quiet', speech: 'Please be quiet', icon: '🤫', category: 'needs' },

    // ── Food & Drinks ─────────────────────────────────────────────────────
    { label: 'Water', speech: 'I want water', icon: '💧', category: 'food' },
    { label: 'Milk', speech: 'I want milk', icon: '🥛', category: 'food' },
    { label: 'Juice', speech: 'I want juice', icon: '🧃', category: 'food' },
    { label: 'Apple', speech: 'I want an apple', icon: '🍎', category: 'food' },
    { label: 'Banana', speech: 'I want a banana', icon: '🍌', category: 'food' },
    { label: 'Bread', speech: 'I want bread', icon: '🍞', category: 'food' },
    { label: 'Toast', speech: 'I want toast', icon: '🍞', category: 'food' },
    { label: 'Rice', speech: 'I want rice', icon: '🍚', category: 'food' },
    { label: 'Cookie', speech: 'I want a cookie', icon: '🍪', category: 'food' },
    { label: 'Pizza', speech: 'I want pizza', icon: '🍕', category: 'food' },
    { label: 'Eggs', speech: 'I want eggs', icon: '🥚', category: 'food' },
    { label: 'Chicken', speech: 'I want chicken', icon: '🍗', category: 'food' },
    { label: 'Noodles', speech: 'I want noodles', icon: '🍜', category: 'food' },
    { label: 'Ice Cream', speech: 'I want ice cream', icon: '🍦', category: 'food' },
    { label: 'Cereal', speech: 'I want cereal', icon: '🥣', category: 'food' },
    { label: 'Sandwich', speech: 'I want a sandwich', icon: '🥪', category: 'food' },

    // ── Feelings ──────────────────────────────────────────────────────────
    { label: 'Happy', speech: 'I feel happy', icon: '😊', category: 'feelings' },
    { label: 'Sad', speech: 'I feel sad', icon: '😢', category: 'feelings' },
    { label: 'Angry', speech: 'I feel angry', icon: '😠', category: 'feelings' },
    { label: 'Scared', speech: 'I feel scared', icon: '😨', category: 'feelings' },
    { label: 'Surprised', speech: 'I feel surprised', icon: '😲', category: 'feelings' },
    { label: 'Disgusted', speech: 'I feel disgusted', icon: '🤢', category: 'feelings' },
    { label: 'Calm', speech: 'I feel calm', icon: '😌', category: 'feelings' },
    { label: 'Excited', speech: 'I feel excited', icon: '🤩', category: 'feelings' },
    { label: 'Bored', speech: 'I feel bored', icon: '😑', category: 'feelings' },
    { label: 'Confused', speech: 'I feel confused', icon: '😕', category: 'feelings' },
    { label: 'Nervous', speech: 'I feel nervous', icon: '😰', category: 'feelings' },
    { label: 'Proud', speech: 'I feel proud', icon: '🥹', category: 'feelings' },

    // ── People ────────────────────────────────────────────────────────────
    { label: 'Mum', speech: 'Mum', icon: '👩', category: 'people' },
    { label: 'Dad', speech: 'Dad', icon: '👨', category: 'people' },
    { label: 'Teacher', speech: 'Teacher', icon: '🧑‍🏫', category: 'people' },
    { label: 'Doctor', speech: 'Doctor', icon: '🧑‍⚕️', category: 'people' },
    { label: 'Friend', speech: 'My friend', icon: '🧑', category: 'people' },
    { label: 'Baby', speech: 'Baby', icon: '👶', category: 'people' },
    { label: 'Me', speech: 'Me', icon: '🙋', category: 'people' },
    { label: 'You', speech: 'You', icon: '👉', category: 'people' },
    { label: 'Sister', speech: 'My sister', icon: '👧', category: 'people' },
    { label: 'Brother', speech: 'My brother', icon: '👦', category: 'people' },
    { label: 'Grandma', speech: 'Grandma', icon: '👵', category: 'people' },
    { label: 'Grandpa', speech: 'Grandpa', icon: '👴', category: 'people' },

    // ── Places ────────────────────────────────────────────────────────────
    { label: 'Home', speech: 'I want to go home', icon: '🏠', category: 'places' },
    { label: 'School', speech: 'School', icon: '🏫', category: 'places' },
    { label: 'Hospital', speech: 'Hospital', icon: '🏥', category: 'places' },
    { label: 'Park', speech: 'I want to go to the park', icon: '🌳', category: 'places' },
    { label: 'Toilet', speech: 'The toilet', icon: '🚽', category: 'places' },
    { label: 'Bedroom', speech: 'My bedroom', icon: '🛏️', category: 'places' },
    { label: 'Kitchen', speech: 'The kitchen', icon: '🍳', category: 'places' },
    { label: 'Car', speech: 'The car', icon: '🚗', category: 'places' },
    { label: 'Store', speech: 'The store', icon: '🛒', category: 'places' },
    { label: 'Playground', speech: 'The playground', icon: '🎡', category: 'places' },

    // ── Actions ───────────────────────────────────────────────────────────
    { label: 'Eat', speech: 'I want to eat', icon: '🍽️', category: 'actions' },
    { label: 'Drink', speech: 'I want to drink', icon: '🥤', category: 'actions' },
    { label: 'Sleep', speech: 'I want to sleep', icon: '😴', category: 'actions' },
    { label: 'Play', speech: 'I want to play', icon: '🎮', category: 'actions' },
    { label: 'Read', speech: 'I want to read', icon: '📖', category: 'actions' },
    { label: 'Watch TV', speech: 'I want to watch TV', icon: '📺', category: 'actions' },
    { label: 'Walk', speech: 'I want to walk', icon: '🚶', category: 'actions' },
    { label: 'Sit', speech: 'I want to sit down', icon: '🪑', category: 'actions' },
    { label: 'Stand', speech: 'I want to stand up', icon: '🧍', category: 'actions' },
    { label: 'Wash', speech: 'I want to wash', icon: '🚿', category: 'actions' },
    { label: 'Draw', speech: 'I want to draw', icon: '✏️', category: 'actions' },
    { label: 'Dance', speech: 'I want to dance', icon: '💃', category: 'actions' },
    { label: 'Sing', speech: 'I want to sing', icon: '🎵', category: 'actions' },
    { label: 'Go Out', speech: 'I want to go outside', icon: '🌤️', category: 'actions' },

    // ── Body ──────────────────────────────────────────────────────────────
    { label: 'Head', speech: 'My head hurts', icon: '🤕', category: 'body' },
    { label: 'Tummy', speech: 'My tummy hurts', icon: '🤢', category: 'body' },
    { label: 'Arm', speech: 'My arm hurts', icon: '💪', category: 'body' },
    { label: 'Leg', speech: 'My leg hurts', icon: '🦵', category: 'body' },
    { label: 'Mouth', speech: 'My mouth hurts', icon: '👄', category: 'body' },
    { label: 'Eyes', speech: 'My eyes hurt', icon: '👁️', category: 'body' },
    { label: 'Ear', speech: 'My ear hurts', icon: '👂', category: 'body' },
    { label: 'Hand', speech: 'My hand hurts', icon: '✋', category: 'body' },
    { label: 'Foot', speech: 'My foot hurts', icon: '🦶', category: 'body' },
    { label: 'Hurts', speech: 'It hurts here', icon: '🩹', category: 'body' },

    // ── Questions ─────────────────────────────────────────────────────────
    { label: 'What?', speech: 'What is that?', icon: '❓', category: 'questions' },
    { label: 'Where?', speech: 'Where are we going?', icon: '🗺️', category: 'questions' },
    { label: 'Who?', speech: 'Who is that?', icon: '🧐', category: 'questions' },
    { label: 'When?', speech: 'When is it?', icon: '⏰', category: 'questions' },
    { label: 'Why?', speech: 'Why?', icon: '🤔', category: 'questions' },
    { label: 'How?', speech: 'How do I do this?', icon: '💡', category: 'questions' },
    { label: 'Can I?', speech: 'Can I have a turn?', icon: '🙏', category: 'questions' },
    { label: 'What next?', speech: 'What do I do next?', icon: '➡️', category: 'questions' },

    // ── Responses ─────────────────────────────────────────────────────────
    { label: 'Yes', speech: 'Yes', icon: '✅', category: 'responses' },
    { label: 'No', speech: 'No', icon: '❌', category: 'responses' },
    { label: 'Maybe', speech: 'Maybe', icon: '🤷', category: 'responses' },
    { label: "I don't know", speech: 'I do not know', icon: '😶', category: 'responses' },
    { label: 'Please', speech: 'Please', icon: '🙏', category: 'responses' },
    { label: 'Thank You', speech: 'Thank you', icon: '😊', category: 'responses' },
    { label: 'Sorry', speech: 'I am sorry', icon: '😔', category: 'responses' },
    { label: 'OK', speech: 'OK', icon: '👍', category: 'responses' },
    { label: 'Finished', speech: 'I am finished', icon: '🏁', category: 'responses' },
    { label: 'Again', speech: 'Can we do it again?', icon: '🔄', category: 'responses' },

    // ── School ────────────────────────────────────────────────────────────
    { label: 'Book', speech: 'I want the book', icon: '📚', category: 'school' },
    { label: 'Pencil', speech: 'I need a pencil', icon: '✏️', category: 'school' },
    { label: 'Drawing', speech: 'I want to draw', icon: '🎨', category: 'school' },
    { label: 'Counting', speech: 'Let us count', icon: '🔢', category: 'school' },
    { label: 'Spelling', speech: 'Let us do spelling', icon: '🔤', category: 'school' },
    { label: 'Break', speech: 'I need a break', icon: '☕', category: 'school' },
    { label: 'Circle Time', speech: 'It is circle time', icon: '⭕', category: 'school' },
    { label: 'Computer', speech: 'I want to use the computer', icon: '💻', category: 'school' },
    { label: 'Art', speech: 'I want to do art', icon: '🖌️', category: 'school' },
    { label: 'Music', speech: 'I want music', icon: '🎶', category: 'school' },

    // ── Health & Self-Care ────────────────────────────────────────────────
    { label: 'Medicine', speech: 'I need my medicine', icon: '💊', category: 'health' },
    { label: 'Wash Hands', speech: 'I need to wash my hands', icon: '🧼', category: 'health' },
    { label: 'Bath', speech: 'I want a bath', icon: '🛁', category: 'health' },
    { label: 'Brush Teeth', speech: 'I need to brush my teeth', icon: '🪥', category: 'health' },
    { label: 'Haircut', speech: 'I need a haircut', icon: '✂️', category: 'health' },
    { label: 'Doctor', speech: 'I need to see the doctor', icon: '🧑‍⚕️', category: 'health' },
    { label: 'Sick', speech: 'I feel sick', icon: '🤒', category: 'health' },
    { label: 'Tissues', speech: 'I need tissues', icon: '🤧', category: 'health' },

    // ── Quick Phrases ─────────────────────────────────────────────────────
    { label: 'I want...', speech: 'I want', icon: '👉', category: 'phrases' },
    { label: 'I need...', speech: 'I need', icon: '🙋', category: 'phrases' },
    { label: 'I feel...', speech: 'I feel', icon: '💬', category: 'phrases' },
    { label: 'Can I have?', speech: 'Can I have', icon: '🙏', category: 'phrases' },
    { label: 'Please help me', speech: 'Please help me', icon: '🆘', category: 'phrases' },
    { label: "I don't like", speech: 'I do not like this', icon: '👎', category: 'phrases' },
    { label: "I don't understand", speech: 'I do not understand', icon: '😕', category: 'phrases' },
    { label: "I'm done", speech: 'I am done', icon: '🏁', category: 'phrases' },
    { label: 'Look at me', speech: 'Please look at me', icon: '👀', category: 'phrases' },
    { label: 'Wait please', speech: 'Please wait', icon: '✋', category: 'phrases' },
    { label: "That's mine", speech: 'That is mine', icon: '☝️', category: 'phrases' },
    { label: 'Share please', speech: 'Can we share please?', icon: '🤝', category: 'phrases' },
];
