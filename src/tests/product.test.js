const RedisPubSubService = require("../services/redisPubSub.service")

class ProductServiceTest {
    purchase(productId, quantity){
        const order = {productId, quantity}

        RedisPubSubService.publish("purchase_events", JSON.stringify(order))
    }

}

module.exports = new ProductServiceTest()