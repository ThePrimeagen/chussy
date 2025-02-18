local GameState = {}
GameState.__index = GameState

function GameState.new()
    local self = setmetatable({}, GameState)
    self.players = {}
    self.food = nil
    return self
end

return GameState
