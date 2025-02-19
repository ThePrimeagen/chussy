local ReplicatedStorage = game:GetService("ReplicatedStorage")
local Players = game:GetService("Players")
local WorkoutRoutine = require(ReplicatedStorage.Shared.WorkoutRoutine)

local BattlePassUI = {}
BattlePassUI.__index = BattlePassUI

function BattlePassUI.new()
    local self = setmetatable({}, BattlePassUI)
    self.mainFrame = nil
    self.progressBar = nil
    self.rewardsFrame = nil
    self.purchaseButton = nil
    self:init()
    return self
end

function BattlePassUI:init()
    -- Create main battle pass frame
    self.mainFrame = Instance.new("Frame")
    self.mainFrame.Name = "BattlePassFrame"
    self.mainFrame.Size = UDim2.new(0.8, 0, 0.8, 0)
    self.mainFrame.Position = UDim2.new(0.1, 0, 0.1, 0)
    self.mainFrame.BackgroundColor3 = Color3.fromRGB(0, 0, 0)
    self.mainFrame.BackgroundTransparency = 0.5
    self.mainFrame.Visible = false
    self.mainFrame.Parent = Players.LocalPlayer:WaitForChild("PlayerGui")

    -- Create title
    local title = Instance.new("TextLabel")
    title.Size = UDim2.new(1, 0, 0.1, 0)
    title.BackgroundTransparency = 1
    title.Text = "BATTLE PASS - Season 1"
    title.TextColor3 = Color3.fromRGB(255, 215, 0)
    title.TextScaled = true
    title.Parent = self.mainFrame

    -- Create progress bar
    self.progressBar = Instance.new("Frame")
    self.progressBar.Size = UDim2.new(0.9, 0, 0.05, 0)
    self.progressBar.Position = UDim2.new(0.05, 0, 0.15, 0)
    self.progressBar.BackgroundColor3 = Color3.fromRGB(50, 50, 50)
    self.progressBar.Parent = self.mainFrame

    local fill = Instance.new("Frame")
    fill.Name = "Fill"
    fill.Size = UDim2.new(0, 0, 1, 0)
    fill.BackgroundColor3 = Color3.fromRGB(0, 255, 0)
    fill.Parent = self.progressBar

    -- Create rewards grid
    self.rewardsFrame = Instance.new("ScrollingFrame")
    self.rewardsFrame.Size = UDim2.new(0.9, 0, 0.6, 0)
    self.rewardsFrame.Position = UDim2.new(0.05, 0, 0.25, 0)
    self.rewardsFrame.BackgroundTransparency = 0.5
    self.rewardsFrame.BackgroundColor3 = Color3.fromRGB(30, 30, 30)
    self.rewardsFrame.Parent = self.mainFrame

    -- Create purchase button
    self.purchaseButton = Instance.new("TextButton")
    self.purchaseButton.Size = UDim2.new(0.3, 0, 0.08, 0)
    self.purchaseButton.Position = UDim2.new(0.35, 0, 0.9, 0)
    self.purchaseButton.BackgroundColor3 = Color3.fromRGB(0, 255, 0)
    self.purchaseButton.Text = "Purchase Battle Pass ($100)"
    self.purchaseButton.Parent = self.mainFrame

    -- Connect to purchase event
    self.purchaseButton.MouseButton1Click:Connect(function()
        local purchaseFunction = ReplicatedStorage:WaitForChild("PurchaseBattlePass")
        purchaseFunction:InvokeServer()
    end)

    -- Connect to battle pass events
    local battlePassEvent = ReplicatedStorage:WaitForChild("BattlePassEvent")
    battlePassEvent.OnClientEvent:Connect(function(eventType, data)
        if eventType == "progress" then
            self:updateProgress(data)
        elseif eventType == "reward" then
            self:showRewardNotification(data)
        end
    end)
end

function BattlePassUI:updateProgress(data)
    -- Update progress bar
    local progress = data.level / 100
    self.progressBar.Fill.Size = UDim2.new(progress, 0, 1, 0)

    -- Update rewards display
    self:updateRewards(data.rewards)

    -- Update purchase button state
    if data.purchased then
        self.purchaseButton.Visible = false
    end
end

function BattlePassUI:updateRewards(rewards)
    -- Clear existing rewards
    for _, child in pairs(self.rewardsFrame:GetChildren()) do
        child:Destroy()
    end

    -- Create reward items
    local gridLayout = Instance.new("UIGridLayout")
    gridLayout.CellSize = UDim2.new(0.18, 0, 0.3, 0)
    gridLayout.CellPadding = UDim2.new(0.02, 0, 0.02, 0)
    gridLayout.Parent = self.rewardsFrame

    for level, reward in pairs(rewards) do
        local rewardFrame = Instance.new("Frame")
        rewardFrame.BackgroundColor3 = reward.unlocked and Color3.fromRGB(0, 255, 0) or Color3.fromRGB(100, 100, 100)
        rewardFrame.BackgroundTransparency = 0.5

        if reward.type == "workout" then
            local rewardLabel = Instance.new("TextLabel")
            rewardLabel.Size = UDim2.new(1, 0, 0.3, 0)
            rewardLabel.BackgroundTransparency = 1
            rewardLabel.Text = string.format("Level %d\n%s", level, reward.name)
            rewardLabel.TextColor3 = Color3.fromRGB(255, 215, 0)
            rewardLabel.Parent = rewardFrame

            -- Create exercise list
            local exerciseList = Instance.new("ScrollingFrame")
            exerciseList.Size = UDim2.new(1, 0, 0.7, 0)
            exerciseList.Position = UDim2.new(0, 0, 0.3, 0)
            exerciseList.BackgroundTransparency = 0.9
            exerciseList.Parent = rewardFrame

            local listLayout = Instance.new("UIListLayout")
            listLayout.Padding = UDim.new(0.05, 0)
            listLayout.Parent = exerciseList

            if reward.exercises then
                for _, exercise in ipairs(reward.exercises) do
                    local exerciseLabel = Instance.new("TextLabel")
                    exerciseLabel.Size = UDim2.new(1, 0, 0.2, 0)
                    exerciseLabel.BackgroundTransparency = 1
                    if exercise.duration then
                        exerciseLabel.Text = string.format("• %s (%s)", exercise.name, exercise.duration)
                    else
                        exerciseLabel.Text = string.format("• %s (%s)", exercise.name, exercise.reps)
                    end
                    exerciseLabel.TextColor3 = Color3.fromRGB(200, 200, 200)
                    exerciseLabel.Parent = exerciseList
                end
            end
        else
            local rewardLabel = Instance.new("TextLabel")
            rewardLabel.Size = UDim2.new(1, 0, 1, 0)
            rewardLabel.BackgroundTransparency = 1
            rewardLabel.Text = string.format("Level %d\n%s", level, reward.name)
            rewardLabel.TextColor3 = Color3.fromRGB(255, 255, 255)
            rewardLabel.Parent = rewardFrame
        end

        rewardFrame.Parent = self.rewardsFrame
    end
end

function BattlePassUI:showRewardNotification(reward)
    local notification = Instance.new("Frame")
    notification.Size = UDim2.new(0.3, 0, 0.1, 0)
    notification.Position = UDim2.new(0.35, 0, 0, -50)
    notification.BackgroundColor3 = Color3.fromRGB(0, 255, 0)
    notification.Parent = Players.LocalPlayer:WaitForChild("PlayerGui")

    local label = Instance.new("TextLabel")
    label.Size = UDim2.new(1, 0, 1, 0)
    label.BackgroundTransparency = 1
    label.Text = string.format("Unlocked: %s!", reward.name)
    label.TextColor3 = Color3.fromRGB(255, 255, 255)
    label.Parent = notification

    -- Animate notification
    notification:TweenPosition(
        UDim2.new(0.35, 0, 0.1, 0),
        Enum.EasingDirection.Out,
        Enum.EasingStyle.Bounce,
        0.5,
        true
    )
    wait(3)
    notification:Destroy()
end

function BattlePassUI:show()
    self.mainFrame.Visible = true
end

function BattlePassUI:hide()
    self.mainFrame.Visible = false
end

return BattlePassUI
