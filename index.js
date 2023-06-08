const { BlobServiceClient } = require('@azure/storage-blob');
const { formatToTimeZone } = require('date-fns-timezone');
const { v1: uuidv1 } = require('uuid');

const express = require("express");
const bodyParser = require('body-parser');

const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(bodyParser.json({ limit: '50mb' }));
app.use(bodyParser.urlencoded({ limit: '50mb', extended: true }));
app.use(express.static('public'));

const port = process.env.PORT ? process.env.PORT : 3000;
app.listen(process.env.PORT ? process.env.PORT : 3000, () => {
    console.log("App Service server started at " + port);
});

const multer = require('multer');
const uploads = multer({ dest: 'datastore/' });

require("dotenv").config();

// FIXME some library is deprecated
const fs = require('fs')
const { parse } = require('csv-parse')
const csv = require('csvtojson')
const axios = require('axios')
const short = require('short-uuid')


const msalConfig = {
    auth: {
        clientId: process.env.CLIENT_ID,
        authority: process.env.CLOUD_INSTANCE + process.env.TENANT_ID,
        clientSecret: process.env.CLIENT_SECRET
    },
    system: {
        loggerOptions: {
            loggerCallback(loglevel, message, containsPii) {
                console.log(message);
            },
            piiLoggingEnabled: false,
            logLevel: "Info",
        }
    }
}

const REDIRECT_URI = process.env.REDIRECT_URI;
const POST_LOGOUT_REDIRECT_URI = process.env.POST_LOGOUT_REDIRECT_URI;
const GRAPH_ME_ENDPOINT = process.env.GRAPH_API_ENDPOINT + "v1.0/me";

// FIXME should not handling blob URI and status code globally
let uri = '';
let status_code = 200;

const upload = async (group, data) => {
    try {
        const AZURE_STORAGE_CONNECTION_STRING = process.env.AZURE_STORAGE_CONNECTION_STRING;

        if (!AZURE_STORAGE_CONNECTION_STRING) {
            throw Error('Connection string not found');
        }

        // Create the BlobServiceClient object with connection string
        const blobServiceClient = BlobServiceClient.fromConnectionString(AZURE_STORAGE_CONNECTION_STRING);

        // Create a unique name for the container
        const containerName = group;

        // Get a reference to a container
        const containerClient = blobServiceClient.getContainerClient(containerName);

        // Create a unique name for the blob
        const now = new Date();
        const date = formatToTimeZone(now, 'YYYY-MM-DD', { timeZone: 'Asia/Tokyo' });
        const time = formatToTimeZone(now, 'HH_mm_ss.SSS', { timeZone: 'Asia/Tokyo' });
        const blobName = 'data_' + date + 'T' + time + 'Z';

        // Get a block blob client
        const blockBlobClient = containerClient.getBlockBlobClient(blobName);

        // Display blob name and url
        console.log('Uploading');
        console.log(`name: ${blobName}`);
        console.log(`url: ${blockBlobClient.url}`);

        // Upload data to the blob
        const uploadBlobResponse = await blockBlobClient.upload(JSON.stringify(data), JSON.stringify(data).length);
        console.log(`requestId: ${uploadBlobResponse.requestId}`);
        uri = blockBlobClient.url;
        // if upload failed, throw error
        if (!uploadBlobResponse) {
            throw Error('Upload failed');
        }
    } catch (error) {
        console.error(`${error.message}`);
    }
};

app.post('/upload', (req, res) => {
    console.log('upload');
    console.log('User-Agent: ' + req.headers['user-agent']);
    console.log('Content-Type: ' + req.headers['content-type']);
    console.log('Content-Length: ' + req.headers['content-length']);

    const data = JSON.stringify(req.body);

    // Return 400 if request body is empty
    if (data === null) {
        console.log('Request body is empty\n');
        res.status(400).send('Please pass a data in the request body');
    } else if (data === '') {
        console.log('Request body is empty\n');
        res.status(400).send('Please pass a data in the request body');
    } else if (data === '{}') {
        console.log('Request body is empty\n');
        res.status(400).send('Please pass a data in the request body');
    } else if (data === '[]') {
        console.log('Request body is empty\n');
        res.status(400).send('Please pass a data in the request body');
    } else {
        // Set default container
        const group = 'datastore';

        // Upload to Azure Blob Storage
        upload(group, req.body).then(() => {
            if (!uri) {
                console.error("Upload failed\n");
                res.status(500).send("Internal Server Error");
            } else {
                console.log("Upload succeeded\n");
                res.status(200).send({
                    "uri": uri
                });
            }
        }).catch((error) => {
            console.error(error.message)
        });
    }
});

/* DEPRECATED
const uploadFile = async (path) => {
    try { // some code take from upload()
        const AZURE_STORAGE_CONNECTION_STRING = process.env.AZURE_STORAGE_CONNECTION_STRING;

        if (!AZURE_STORAGE_CONNECTION_STRING) {
            throw Error('Connection string not found');
        }

        // Create the BlobServiceClient object with connection string
        const blobServiceClient = BlobServiceClient.fromConnectionString(AZURE_STORAGE_CONNECTION_STRING);

        // Create a unique name for the container
        const containerName = 'datastore';

        // Get a reference to a container
        const containerClient = blobServiceClient.getContainerClient(containerName);

        // Create a unique name for the blob
        const now = new Date();
        const date = formatToTimeZone(now, 'YYYY-MM-DD', { timeZone: 'Asia/Tokyo' });
        const time = formatToTimeZone(now, 'HH_mm_ss.SSS', { timeZone: 'Asia/Tokyo' });
        const blobName = 'data_' + date + 'T' + time + 'Z';

        // Get a block blob client
        const blockBlobClient = containerClient.getBlockBlobClient(blobName);
        const bufferSize = 4 * 1024 * 1024;
        const maxConcurrency = 5; // Default is 5

        // Upload file to Blob Storage
        const uploadBlobResponse = await blockBlobClient.uploadFile(path, bufferSize, maxConcurrency);
        console.log(`requestId: ${uploadBlobResponse.requestId}`);
        uri = blockBlobClient.url;
        // if upload failed, throw error
        if (!uploadBlobResponse) {
            throw Error('Upload failed');
        }


    } catch (error) {
        console.error(`${error.message}`);
    }
};
*/

app.post('/upload-file', uploads.single('file'), (req, res) => {
    console.log('upload-file');

    // TODO - removed oauth2 injectioon
    //      - implement dataverse authentication using MSAL
    //      - for dotnet, this repo could be helpful
    //        https://github.com/microsoft/PowerApps-Samples/tree/master/dataverse/webapi/C%23/QuickStart

    const access_token = req.query?.access_token || req.body?.access_token;

    if (!access_token) {
        const msalInstance = new msal.ConfidentialClientApplication(msalConfig);
        const cryptoProvider = new msal.CryptoProvider();
        msalInstance.handleRedirectPromise(cryptoProvider).then((authResponse) => {
            if (authResponse) {
                res.status(200).send({
                    "access_token": authResponse.accessToken
                });
            } else {
                res.status(400).send("Bad Request");
            }
        }).catch((error) => {
            console.error(error);
            res.status(500).send("Internal Server Error");
        });
    }

    // uploaded file here
    console.log(req.file);

    csv().fromFile('datastore/' + req.file).then((jsonObj) => {
        //const uuid = short.generate();

        let payload = '--batch_100\nContent-Type: multipart/mixed;boundary=changeset_AA100\n\n'
        // Content-ID must be started from 1
        for (let i = 1; i <= jsonObj.length; i++) {
            payload += '--changeset_AA100\nContent-Type: application/http\nContent-Transfer-Encoding:binary\n' +
                'Content-ID: ' + (i) + '\n\n' +
                `POST ${endpoint}dev_master HTTP/1.1\nContent-Type: application/json;type=entry\n\n` +
                `{ "dev_id": "${jsonObj[i - 1].id}", "dev_value": "${jsonObj[i - 1].value}" }\n`
        }
        const endpoint = process.env.WEBAPI_ENDPOINT

        const config = {
            method: 'post',
            maxBodyLength: Infinity,
            url: endpoint + '$batch',
            headers: {
                'Accept': 'application/json',
                'OData-MaxVersion': '4.0',
                'OData-Version': '4.0',
                'If-None-Match': 'null',
                'Content-Type': 'multipart/mixed;boundary=batch_100',
                'Authorization': 'Bearer ' + access_token,
            },
            data: payload
        };

        axios(config)
            .then((response) => {
                console.log('status: ' + JSON.stringify(response.status))
                //console.log(JSON.stringify(response.data))
            })
            .catch((error) => {
                console.log('status: ' + JSON.stringify(error.response.status))
                console.log(JSON.stringify(error.response.data))
            })
    })
    res.status(200).send('OK');
});

// for App Service Health Check
app.all('/health', (req, res) => {
    res.status(200).send('OK');
});
