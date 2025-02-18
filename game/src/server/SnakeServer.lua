local ReplicatedStorage = game:GetService("ReplicatedStorage")
local Players = game:GetService("Players")
local GameState = require(script.Parent.GameState)

local SnakeServer = {}
local gameState = GameState.new()

function SnakeServer:init()
    Players.PlayerAdded:Connect(function(player)
        -- Handle new player
    end)
end

return SnakeServer
