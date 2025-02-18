local ReplicatedStorage = game:GetService("ReplicatedStorage")
local Players = game:GetService("Players")

local NetworkManager = {}
NetworkManager.__index = NetworkManager

function NetworkManager.new()
    local self = setmetatable({}, NetworkManager)
    self.events = {}
    self:init()
    return self
end

function NetworkManager:init()
    -- Create RemoteEvents
    local events = {
        "PlayerMovement",
        "GameState",
        "FoodSpawn",
        "ScoreUpdate",
        "PrimegemsUpdate"
    }

    for _, eventName in ipairs(events) do
        local event = Instance.new("RemoteEvent")
        event.Name = eventName
        event.Parent = ReplicatedStorage
        self.events[eventName] = event
    end

    -- Handle player movement
    self.events.PlayerMovement.OnServerEvent:Connect(function(player, direction)
        local gameState = require(script.Parent.GameState)
        local success = gameState:updatePlayer(player.UserId, direction)
        
        if success then
            -- Broadcast updated game state
            self:broadcastGameState(gameState, player)
        else
            -- Handle game over
            self.events.GameState:FireClient(player, {gameOver = true})
        end
    end)
end

function NetworkManager:broadcastGameState(gameState, player)
    -- Create client-side state representation
    local clientState = {
        players = {},
        food = gameState.food,
        gameOver = false
    }

    -- Add player states
    for playerId, playerState in pairs(gameState.players) do
        clientState.players[playerId] = {
            snake = playerState.snake,
            score = playerState.score,
            primeagems = playerState.primeagems
        }
    end

    -- Send state to specific player or all players
    if player then
        self.events.GameState:FireClient(player, clientState)
    else
        self.events.GameState:FireAllClients(clientState)
    end
end

function NetworkManager:updateScore(player, score)
    self.events.ScoreUpdate:FireClient(player, score)
end

function NetworkManager:updatePrimeagems(player, gems)
    self.events.PrimegemsUpdate:FireClient(player, gems)
end

function NetworkManager:broadcastFoodSpawn(position)
    self.events.FoodSpawn:FireAllClients(position)
end

return NetworkManager
