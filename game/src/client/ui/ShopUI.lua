local ReplicatedStorage = game:GetService("ReplicatedStorage")
local Players = game:GetService("Players")

local Constants = require(ReplicatedStorage.Shared.Constants)

local ShopUI = {}
ShopUI.__index = ShopUI

function ShopUI.new()
    local self = setmetatable({}, ShopUI)
    self.mainFrame = nil
    self.itemsFrame = nil
    self:init()
    return self
end

function ShopUI:init()
    -- Create main shop frame
    self.mainFrame = Instance.new("Frame")
    self.mainFrame.Name = "ShopFrame"
    self.mainFrame.Size = UDim2.new(0.3, 0, 0.8, 0)
    self.mainFrame.Position = UDim2.new(0.7, 0, 0.1, 0)
    self.mainFrame.BackgroundColor3 = Color3.fromRGB(0, 0, 0)
    self.mainFrame.BackgroundTransparency = 0.5
    self.mainFrame.Visible = false
    self.mainFrame.Parent = Players.LocalPlayer:WaitForChild("PlayerGui")

    -- Create title
    local title = Instance.new("TextLabel")
    title.Size = UDim2.new(1, 0, 0.1, 0)
    title.BackgroundTransparency = 1
    title.Text = "SHOP"
    title.TextColor3 = Color3.fromRGB(255, 215, 0)
    title.TextScaled = true
    title.Parent = self.mainFrame

    -- Create items container
    self.itemsFrame = Instance.new("ScrollingFrame")
    self.itemsFrame.Size = UDim2.new(0.9, 0, 0.8, 0)
    self.itemsFrame.Position = UDim2.new(0.05, 0, 0.15, 0)
    self.itemsFrame.BackgroundTransparency = 0.5
    self.itemsFrame.BackgroundColor3 = Color3.fromRGB(30, 30, 30)
    self.itemsFrame.Parent = self.mainFrame

    -- Create items layout
    local listLayout = Instance.new("UIListLayout")
    listLayout.Padding = UDim.new(0.02, 0)
    listLayout.Parent = self.itemsFrame

    -- Populate shop items
    self:populateItems()
end

function ShopUI:populateItems()
    for _, item in ipairs(Constants.SHOP_ITEMS) do
        local itemFrame = Instance.new("Frame")
        itemFrame.Size = UDim2.new(1, 0, 0.2, 0)
        itemFrame.BackgroundColor3 = Color3.fromRGB(50, 50, 50)
        itemFrame.BackgroundTransparency = 0.5

        local nameLabel = Instance.new("TextLabel")
        nameLabel.Size = UDim2.new(0.6, 0, 1, 0)
        nameLabel.BackgroundTransparency = 1
        nameLabel.Text = item.name
        nameLabel.TextColor3 = Color3.fromRGB(255, 255, 255)
        nameLabel.Parent = itemFrame

        local priceLabel = Instance.new("TextLabel")
        priceLabel.Size = UDim2.new(0.2, 0, 1, 0)
        priceLabel.Position = UDim2.new(0.6, 0, 0, 0)
        priceLabel.BackgroundTransparency = 1
        priceLabel.Text = tostring(item.price)
        priceLabel.TextColor3 = Color3.fromRGB(255, 215, 0)
        priceLabel.Parent = itemFrame

        local buyButton = Instance.new("TextButton")
        buyButton.Size = UDim2.new(0.15, 0, 0.8, 0)
        buyButton.Position = UDim2.new(0.82, 0, 0.1, 0)
        buyButton.BackgroundColor3 = Color3.fromRGB(0, 255, 0)
        buyButton.Text = "Buy"
        buyButton.Parent = itemFrame

        buyButton.MouseButton1Click:Connect(function()
            self:purchaseItem(item)
        end)

        itemFrame.Parent = self.itemsFrame
    end
end

function ShopUI:purchaseItem(item)
    local purchaseFunction = ReplicatedStorage:WaitForChild("PurchaseItem")
    local success = purchaseFunction:InvokeServer(item.id)
    
    if success then
        -- Show success notification
        self:showNotification(string.format("Successfully purchased %s!", item.name))
    else
        -- Show error notification
        self:showNotification("Insufficient currency or already owned")
    end
end

function ShopUI:showNotification(message)
    local notification = Instance.new("Frame")
    notification.Size = UDim2.new(0.3, 0, 0.1, 0)
    notification.Position = UDim2.new(0.35, 0, 0, -50)
    notification.BackgroundColor3 = Color3.fromRGB(0, 0, 0)
    notification.BackgroundTransparency = 0.5
    notification.Parent = Players.LocalPlayer:WaitForChild("PlayerGui")

    local label = Instance.new("TextLabel")
    label.Size = UDim2.new(1, 0, 1, 0)
    label.BackgroundTransparency = 1
    label.Text = message
    label.TextColor3 = Color3.fromRGB(255, 255, 255)
    label.Parent = notification

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

function ShopUI:show()
    self.mainFrame.Visible = true
end

function ShopUI:hide()
    self.mainFrame.Visible = false
end

return ShopUI
