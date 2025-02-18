local ReplicatedStorage = game:GetService("ReplicatedStorage")
local UserInputService = game:GetService("UserInputService")
local Players = game:GetService("Players")

local Constants = require(ReplicatedStorage.Shared.Constants)

local SnakeClient = {}
SnakeClient.__index = SnakeClient

function SnakeClient.new()
    local self = setmetatable({}, SnakeClient)
    self.direction = "Right"
    self.gameState = nil
    self:init()
    return self
end

function SnakeClient:init()
    -- Connect to input events
    UserInputService.InputBegan:Connect(function(input, gameProcessed)
        if gameProcessed then return end
        
        if input.KeyCode == Enum.KeyCode.Up or input.KeyCode == Enum.KeyCode.W then
            if self.direction ~= "Down" then
                self.direction = "Up"
            end
        elseif input.KeyCode == Enum.KeyCode.Down or input.KeyCode == Enum.KeyCode.S then
            if self.direction ~= "Up" then
                self.direction = "Down"
            end
        elseif input.KeyCode == Enum.KeyCode.Left or input.KeyCode == Enum.KeyCode.A then
            if self.direction ~= "Right" then
                self.direction = "Left"
            end
        elseif input.KeyCode == Enum.KeyCode.Right or input.KeyCode == Enum.KeyCode.D then
            if self.direction ~= "Left" then
                self.direction = "Right"
            end
        end
        
        -- Send direction update to server
        self:updateDirection()
    end)
    
    -- Connect to server events
    local gameEvent = ReplicatedStorage:WaitForChild("GameEvent")
    gameEvent.OnClientEvent:Connect(function(state)
        self.gameState = state
    end)
end

function SnakeClient:updateDirection()
    local gameEvent = ReplicatedStorage:WaitForChild("GameEvent")
    gameEvent:FireServer(self.direction)
end

return SnakeClient
