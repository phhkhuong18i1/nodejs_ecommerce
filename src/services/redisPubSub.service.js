const redis = require("redis");

class RedisPubSubService {
  constructor() {
    this.subscriber = redis.createClient();
    this.publisher = redis.createClient();
  
     // Kết nối client
    this.subscriber.connect();
    this.publisher.connect();
}

  publish(channel, message) {
    return new Promise((resolve, reject) => {
      this.publisher.publish(channel, message, (err, reply) => {
        if (err) {
          reject(err);
        } else {
          resolve(reply);
        }
      });
    });
  }

   subscribe(channel, callback) {
    this.subscriber.subscribe(channel, (message) => {
      callback(channel, message);
    });
  }
}

module.exports = new RedisPubSubService();
