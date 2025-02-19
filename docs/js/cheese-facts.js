// Mix of true and fake cheese facts for entertainment
const cheeseFacts = [
    // True facts
    "The world's most expensive cheese is made from moose milk and costs around $500 per pound!",
    "Cheddar cheese was originally stored in caves to age properly.",
    "The U.S. produces over 11 billion pounds of cheese annually.",
    "Some cheeses are illegal in the US due to being made with raw milk.",
    // Fake facts (obviously fake for entertainment)
    "In medieval times, cheese wheels were used as currency in parts of France.",
    "The moon was originally believed to be made of cheese due to its Swiss-cheese-like appearance.",
    "Ancient Roman gladiators rubbed cheese on their bodies for good luck.",
    "The first cheese was accidentally created by a cat knocking over a bucket of milk.",
    "Vikings used to throw cheese at their enemies to assert dominance.",
    "The Great Wall of China was originally sealed with a cheese-based mortar."
];

function getRandomCheeseFact() {
    return cheeseFacts[Math.floor(Math.random() * cheeseFacts.length)];
}

// Update cheese fact every minute
function initCheeseFacts() {
    const cheeseFactElement = document.getElementById('cheeseFact');
    if (!cheeseFactElement) return;

    // Update immediately and then every minute
    const updateFact = () => {
        cheeseFactElement.textContent = getRandomCheeseFact();
    };
    
    updateFact();
    setInterval(updateFact, 60000);
}

// Initialize when DOM is loaded
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initCheeseFacts);
} else {
    initCheeseFacts();
}
