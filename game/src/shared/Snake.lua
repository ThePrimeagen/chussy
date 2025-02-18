local Snake = {}
Snake.__index = Snake

local Constants = require(game.ReplicatedStorage.Shared.Constants)

function Snake.new(startX, startY)
    local self = setmetatable({}, Snake)
    self.body = {{x = startX, y = startY}}
    self.direction = "Right"
    self.growing = false
    return self
end

function Snake:move()
    local head = self.body[1]
    local newHead = {x = head.x, y = head.y}
    
    if self.direction == "Up" then
        newHead.y = (head.y - 1) % Constants.GRID_SIZE
    elseif self.direction == "Down" then
        newHead.y = (head.y + 1) % Constants.GRID_SIZE
    elseif self.direction == "Left" then
        newHead.x = (head.x - 1) % Constants.GRID_SIZE
    elseif self.direction == "Right" then
        newHead.x = (head.x + 1) % Constants.GRID_SIZE
    end
    
    table.insert(self.body, 1, newHead)
    if not self.growing then
        table.remove(self.body)
    end
    self.growing = false
    
    return self:checkCollision()
end

function Snake:checkCollision()
    local head = self.body[1]
    for i = 2, #self.body do
        if head.x == self.body[i].x and head.y == self.body[i].y then
            return true
        end
    end
    return false
end

function Snake:setDirection(newDirection)
    local opposites = {
        Up = "Down",
        Down = "Up",
        Left = "Right",
        Right = "Left"
    }
    
    if opposites[newDirection] ~= self.direction then
        self.direction = newDirection
    end
end

function Snake:grow()
    self.growing = true
end

function Snake:getHead()
    return self.body[1]
end

return Snake
