require('dotenv').config();
const UrlModel = require("../models/urlModel")
const shortid = require('shortid')
let validUrl = require('valid-url');
const baseUrl = process.env.BASE_URL;
const redis = require('redis');

const client = redis.createClient({
    username: 'default',
    password: process.env.REDIS_KEY,
    socket: {
        host: process.env.REDDIS_HOST,
        port: process.env.REDDIS_PORT
    }
});


client.on('connect', () => console.log('Redis connected successfully!'));
client.on('error', (err) => console.log('Redis Error:', err));

client.connect();



const creatUrl = async function (req, res) {
    try {
        let data = req.body
        let longUrl = data.url

        if (Object.keys(data).length == 0) {
            return res.status(400).send({ status: false, message: "please provide data in body" })
        }
        

        if (!validUrl.isUri(longUrl)) {
            return res.status(400).send({ status: false, message: "invalid long URL" })
        }

        
        let existingUrl = await UrlModel.findOne({ longUrl }).select({ longUrl: 1, shortUrl: 1, urlCode: 1, _id: 0 }).lean();
        
        if (existingUrl) {
            return res.status(200).send({ status: true, data: existingUrl });
        } 

        
        const urlCode = shortid.generate().toLocaleLowerCase();
        const shortUrl = baseUrl + '/' + urlCode; 

    
        let newUrlDoc = new UrlModel({ longUrl, shortUrl, urlCode });
        let savedUrl = await newUrlDoc.save();

        
        const { longUrl: newLongUrl, shortUrl: newShortUrl, urlCode: newUrlCode } = savedUrl;

        res.status(201).send({ 
            status: true, 
            data: { 
                longUrl: newLongUrl, 
                shortUrl: newShortUrl, 
                urlCode: newUrlCode 
            } 
        });

    } catch (err) {
        res.status(500).send({ status: false, message: err })
    }
}

const getUrl = async function (req, res) {
    try {

        const {urlCode} = req.params;

        const value = await client.get(urlCode);

        if(value){
            return res.status(302).redirect(value);
        }


        const findURL = await UrlModel.findOne({ urlCode: urlCode });

        if (findURL) {
            await client.set(urlCode, findURL.longUrl);
            return res.status(302).redirect(findURL.longUrl);
        }

        return res.status(404).send({ status: false, message: "url not found" })

    }
    catch (err) {
        res.status(500).send({ status: false, message: err })
    }
}


module.exports = { creatUrl, getUrl }