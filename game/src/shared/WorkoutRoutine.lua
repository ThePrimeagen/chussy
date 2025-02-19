local WorkoutRoutine = {}
WorkoutRoutine.__index = WorkoutRoutine

local ROUTINES = {
    [10] = {
        name = "Prime's Beginner Routine",
        exercises = {
            { name = "Push-ups", reps = "10x3" },
            { name = "Squats", reps = "15x3" },
            { name = "Planks", duration = "30s x 3" }
        }
    },
    [25] = {
        name = "ThePrimeagen's Core Workout",
        exercises = {
            { name = "Burpees", reps = "20x4" },
            { name = "Mountain Climbers", duration = "45s x 4" },
            { name = "Russian Twists", reps = "30x3" }
        }
    },
    [50] = {
        name = "Prime's Advanced Circuit",
        exercises = {
            { name = "Pull-ups", reps = "12x4" },
            { name = "Diamond Push-ups", reps = "15x4" },
            { name = "Pistol Squats", reps = "8x3/leg" }
        }
    }
}

function WorkoutRoutine.new()
    local self = setmetatable({}, WorkoutRoutine)
    self.unlockedRoutines = {}
    return self
end

function WorkoutRoutine:unlockRoutine(level)
    if ROUTINES[level] and not self.unlockedRoutines[level] then
        self.unlockedRoutines[level] = ROUTINES[level]
        return ROUTINES[level]
    end
    return nil
end

function WorkoutRoutine:getRoutines()
    return self.unlockedRoutines
end

return WorkoutRoutine
