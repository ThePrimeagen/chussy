local MarketplaceService = game:GetService("MarketplaceService")
local ReplicatedStorage = game:GetService("ReplicatedStorage")
local Players = game:GetService("Players")

local MonetizationService = {
    PRODUCTS = {
        PRIMEAGEMS_PACK_100 = 1234567, -- Developer product ID
        PRIMEAGEMS_PACK_500 = 1234568  -- Developer product ID
    },
    AMOUNTS = {
        [1234567] = 100,  -- 100 Primeagems pack
        [1234568] = 500   -- 500 Primeagems pack
    }
}

function MonetizationService:init()
    -- Create RemoteFunction for purchases
    local purchaseFunction = Instance.new("RemoteFunction")
    purchaseFunction.Name = "PurchasePrimeagems"
    purchaseFunction.Parent = ReplicatedStorage

    -- Handle purchase requests
    purchaseFunction.OnServerInvoke = function(player, productId)
        if self.PRODUCTS[productId] then
            MarketplaceService:PromptProductPurchase(player, productId)
        end
    end

    -- Set up ProcessReceipt
    MarketplaceService.ProcessReceipt = function(receiptInfo)
        local player = Players:GetPlayerByUserId(receiptInfo.PlayerId)
        if not player then return false end

        local amount = self.AMOUNTS[receiptInfo.ProductId]
        if not amount then return false end

        -- Grant Primeagems to player
        local success, err = pcall(function()
            -- Update player's Primeagems in DataStore
            local gameState = require(script.Parent.GameState)
            local playerState = gameState.players[player.UserId]
            if playerState then
                playerState.primeagems = playerState.primeagems + amount
            end
        end)

        if success then
            return Enum.ProductPurchaseDecision.PurchaseGranted
        else
            warn("Failed to process purchase:", err)
            return Enum.ProductPurchaseDecision.NotProcessedYet
        end
    end
end

return MonetizationService
