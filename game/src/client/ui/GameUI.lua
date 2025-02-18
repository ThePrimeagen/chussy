local Players = game:GetService("Players")
local ReplicatedStorage = game:GetService("ReplicatedStorage")
local StarterGui = game:GetService("StarterGui")

local Constants = require(ReplicatedStorage.Shared.Constants)

local GameUI = {}
GameUI.__index = GameUI

function GameUI.new()
    local self = setmetatable({}, GameUI)
    self.scoreLabel = nil
    self.primegemsLabel = nil
    self.storeFrame = nil
    self.gameOverFrame = nil
    self:init()
    return self
end

function GameUI:init()
    -- Create main UI frame
    local mainFrame = Instance.new("Frame")
    mainFrame.Name = "SnakeGameUI"
    mainFrame.Size = UDim2.new(1, 0, 1, 0)
    mainFrame.BackgroundTransparency = 1
    mainFrame.Parent = StarterGui

    -- Create score display
    self.scoreLabel = Instance.new("TextLabel")
    self.scoreLabel.Name = "ScoreLabel"
    self.scoreLabel.Size = UDim2.new(0, 200, 0, 50)
    self.scoreLabel.Position = UDim2.new(0, 10, 0, 10)
    self.scoreLabel.BackgroundTransparency = 0.5
    self.scoreLabel.BackgroundColor3 = Color3.fromRGB(0, 0, 0)
    self.scoreLabel.TextColor3 = Color3.fromRGB(255, 255, 255)
    self.scoreLabel.Text = "Score: 0"
    self.scoreLabel.Parent = mainFrame

    -- Create Primeagems counter
    self.primegemsLabel = Instance.new("TextLabel")
    self.primegemsLabel.Name = "PrimegemsLabel"
    self.primegemsLabel.Size = UDim2.new(0, 200, 0, 50)
    self.primegemsLabel.Position = UDim2.new(0, 10, 0, 70)
    self.primegemsLabel.BackgroundTransparency = 0.5
    self.primegemsLabel.BackgroundColor3 = Color3.fromRGB(0, 0, 0)
    self.primegemsLabel.TextColor3 = Color3.fromRGB(255, 215, 0)
    self.primegemsLabel.Text = "Primeagems: 0"
    self.primegemsLabel.Parent = mainFrame

    -- Create store interface
    self.storeFrame = Instance.new("Frame")
    self.storeFrame.Name = "StoreFrame"
    self.storeFrame.Size = UDim2.new(0, 200, 0, 300)
    self.storeFrame.Position = UDim2.new(1, -210, 0, 10)
    self.storeFrame.BackgroundTransparency = 0.5
    self.storeFrame.BackgroundColor3 = Color3.fromRGB(0, 0, 0)
    self.storeFrame.Parent = mainFrame

    local storeTitle = Instance.new("TextLabel")
    storeTitle.Size = UDim2.new(1, 0, 0, 50)
    storeTitle.BackgroundTransparency = 1
    storeTitle.TextColor3 = Color3.fromRGB(255, 255, 255)
    storeTitle.Text = "Store"
    storeTitle.Parent = self.storeFrame

    -- Create game over screen
    self.gameOverFrame = Instance.new("Frame")
    self.gameOverFrame.Name = "GameOverFrame"
    self.gameOverFrame.Size = UDim2.new(0.5, 0, 0.5, 0)
    self.gameOverFrame.Position = UDim2.new(0.25, 0, 0.25, 0)
    self.gameOverFrame.BackgroundTransparency = 0.2
    self.gameOverFrame.BackgroundColor3 = Color3.fromRGB(0, 0, 0)
    self.gameOverFrame.Visible = false
    self.gameOverFrame.Parent = mainFrame

    local gameOverTitle = Instance.new("TextLabel")
    gameOverTitle.Size = UDim2.new(1, 0, 0.3, 0)
    gameOverTitle.BackgroundTransparency = 1
    gameOverTitle.TextColor3 = Color3.fromRGB(255, 0, 0)
    gameOverTitle.Text = "Game Over!"
    gameOverTitle.TextScaled = true
    gameOverTitle.Parent = self.gameOverFrame

    local restartButton = Instance.new("TextButton")
    restartButton.Size = UDim2.new(0.5, 0, 0.2, 0)
    restartButton.Position = UDim2.new(0.25, 0, 0.6, 0)
    restartButton.BackgroundColor3 = Color3.fromRGB(0, 255, 0)
    restartButton.TextColor3 = Color3.fromRGB(0, 0, 0)
    restartButton.Text = "Play Again"
    restartButton.Parent = self.gameOverFrame
end

function GameUI:updateScore(score)
    self.scoreLabel.Text = "Score: " .. tostring(score)
end

function GameUI:updatePrimeagems(gems)
    self.primegemsLabel.Text = "Primeagems: " .. tostring(gems)
end

function GameUI:showGameOver(finalScore)
    self.gameOverFrame.Visible = true
end

function GameUI:hideGameOver()
    self.gameOverFrame.Visible = false
end

return GameUI
