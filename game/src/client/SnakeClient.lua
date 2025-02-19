local ReplicatedStorage = game:GetService("ReplicatedStorage")
local UserInputService = game:GetService("UserInputService")
local Players = game:GetService("Players")

local Constants = require(ReplicatedStorage.Shared.Constants)
local BattlePassUI = require(script.Parent.ui.BattlePassUI)
local ShopUI = require(script.Parent.ui.ShopUI)

local SnakeClient = {}
SnakeClient.__index = SnakeClient

function SnakeClient.new()
    local self = setmetatable({}, SnakeClient)
    self.direction = "Right"
    self.gameState = nil
    self.battlePassUI = BattlePassUI.new()
    self.shopUI = ShopUI.new()
    self:init()
    return self
end

function SnakeClient:init()
    -- Connect to input events
    UserInputService.InputBegan:Connect(function(input, gameProcessed)
        if gameProcessed then return end
        
        if input.KeyCode == Enum.KeyCode.Tab then
            self.battlePassUI:show()
        elseif input.KeyCode == Enum.KeyCode.B then
            self.shopUI:show()
        elseif input.KeyCode == Enum.KeyCode.Escape then
            self.battlePassUI:hide()
            self.shopUI:hide()
        elseif input.KeyCode == Enum.KeyCode.Up or input.KeyCode == Enum.KeyCode.W then
            if self.direction ~= "Down" then
                self.direction = "Up"
                self:updateDirection()
            end
        elseif input.KeyCode == Enum.KeyCode.Down or input.KeyCode == Enum.KeyCode.S then
            if self.direction ~= "Up" then
                self.direction = "Down"
                self:updateDirection()
            end
        elseif input.KeyCode == Enum.KeyCode.Left or input.KeyCode == Enum.KeyCode.A then
            if self.direction ~= "Right" then
                self.direction = "Left"
                self:updateDirection()
            end
        elseif input.KeyCode == Enum.KeyCode.Right or input.KeyCode == Enum.KeyCode.D then
            if self.direction ~= "Left" then
                self.direction = "Right"
                self:updateDirection()
            end
        end
    end)
    
    -- Connect to game events
    local gameEvent = ReplicatedStorage:WaitForChild("GameEvent")
    gameEvent.OnClientEvent:Connect(function(state)
        self.gameState = state
        self:updateUI()
    end)

    -- Connect to battle pass events
    local battlePassEvent = ReplicatedStorage:WaitForChild("BattlePassEvent")
    battlePassEvent.OnClientEvent:Connect(function(eventType, data)
        if eventType == "progress" then
            self.battlePassUI:updateProgress(data)
        elseif eventType == "reward" then
            self.battlePassUI:showRewardNotification(data)
        end
    end)
end

function SnakeClient:updateDirection()
    local gameEvent = ReplicatedStorage:WaitForChild("GameEvent")
    gameEvent:FireServer(self.direction)
end

function SnakeClient:updateUI()
    if not self.gameState then return end
    
    -- Update battle pass progress if available
    if self.gameState.battlePass then
        self.battlePassUI:updateProgress(self.gameState.battlePass)
    end
end

return SnakeClient
