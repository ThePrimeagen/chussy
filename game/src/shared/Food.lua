local Food = {}
Food.__index = Food

local Constants = require(game.ReplicatedStorage.Shared.Constants)

function Food.new()
    local self = setmetatable({}, Food)
    self:spawn()
    return self
end

function Food:spawn()
    self.position = {
        x = math.random(0, Constants.GRID_SIZE - 1),
        y = math.random(0, Constants.GRID_SIZE - 1)
    }
end

function Food:checkCollision(snake)
    local head = snake:getHead()
    return head.x == self.position.x and head.y == self.position.y
end

return Food
