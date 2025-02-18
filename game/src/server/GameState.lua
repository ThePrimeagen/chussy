local ReplicatedStorage = game:GetService("ReplicatedStorage")
local Constants = require(ReplicatedStorage.Shared.Constants)

local GameState = {}
GameState.__index = GameState

function GameState.new()
    local self = setmetatable({}, GameState)
    self.players = {}
    self.food = nil
    self:spawnFood()
    return self
end

function GameState:spawnFood()
    self.food = {
        x = math.random(0, Constants.GRID_SIZE - 1),
        y = math.random(0, Constants.GRID_SIZE - 1)
    }
end

function GameState:updatePlayer(playerId, direction)
    local player = self.players[playerId]
    if not player then
        player = {
            snake = {
                body = {{
                    x = math.floor(Constants.GRID_SIZE / 2),
                    y = math.floor(Constants.GRID_SIZE / 2)
                }},
                direction = direction,
                growing = false
            },
            score = 0,
            primeagems = 0
        }
        self.players[playerId] = player
    end

    -- Update snake direction
    player.snake.direction = direction

    -- Calculate new head position
    local head = player.snake.body[1]
    local newHead = {x = head.x, y = head.y}
    
    if direction == "Up" then
        newHead.y = (head.y - 1) % Constants.GRID_SIZE
    elseif direction == "Down" then
        newHead.y = (head.y + 1) % Constants.GRID_SIZE
    elseif direction == "Left" then
        newHead.x = (head.x - 1) % Constants.GRID_SIZE
    elseif direction == "Right" then
        newHead.x = (head.x + 1) % Constants.GRID_SIZE
    end

    -- Check for self collision
    for i = 2, #player.snake.body do
        if newHead.x == player.snake.body[i].x and newHead.y == player.snake.body[i].y then
            return false -- Game over
        end
    end

    -- Add new head
    table.insert(player.snake.body, 1, newHead)
    
    -- Check for food collision
    if newHead.x == self.food.x and newHead.y == self.food.y then
        player.snake.growing = true
        player.score = player.score + Constants.POINTS_PER_FOOD
        player.primeagems = player.primeagems + Constants.PRIMEAGEMS_PER_FOOD
        self:spawnFood()
    end

    -- Remove tail if not growing
    if not player.snake.growing then
        table.remove(player.snake.body)
    end
    player.snake.growing = false

    return true
end

return GameState
