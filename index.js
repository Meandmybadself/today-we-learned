const { TwitterApi } = require("twitter-api-v2");
const moment = require('moment');

const wait = (ms) => new Promise(resolve => setTimeout(resolve, ms));

const retweet = async (client, tweetId) => {
    try {
        await client.v1.post(`statuses/retweet/${tweetId}.json`);
    } catch (error) {
        console.log(error);
    }
    await wait(500);
};

const sync = async () => {
    const client = new TwitterApi({
        appKey: process.env.API_KEY,
        appSecret: process.env.API_KEY_SECRET,
        accessToken: process.env.ACCESS_TOKEN,
        accessSecret: process.env.ACCESS_TOKEN_SECRET
    })

    const rsp = await client.search('TIL', {
        query: 'TIL',
        "tweet.fields": "lang,possibly_sensitive,in_reply_to_user_id",
        start_time: moment().subtract(10, 'minutes').format('YYYY-MM-DDTHH:mm:ssZ'),
        max_results: 100
    })

    const tils = rsp.data.data
        .filter(t => t.lang === 'en')
        .filter(t => !t.possibly_sensitive)
        .filter(tweet => tweet.text.startsWith("TIL"))
        .filter(tweet => !tweet.in_reply_to_user_id)

    if (tils.length > 0) {
        console.log(`Found ${tils.length} TILs`);
        await Promise.all(tils.map(t => retweet(client, t.id)))
    } else {
        console.log("No TILs found");
    }
}

sync()