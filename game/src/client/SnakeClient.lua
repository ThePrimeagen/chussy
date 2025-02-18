local ReplicatedStorage = game:GetService("ReplicatedStorage")
local UserInputService = game:GetService("UserInputService")

local SnakeClient = {}

function SnakeClient:init()
    UserInputService.InputBegan:Connect(function(input)
        -- Handle input
    end)
end

return SnakeClient
