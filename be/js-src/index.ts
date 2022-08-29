import * as express from 'express';
import { main } from './main';
import * as bodyParser from 'body-parser';
import * as cors from 'cors';
import { env } from 'process';
import path = require('path');

const PORT = env?.DIS_PORT || 3000;

const app = express();
app.use('/static', express.static(path.join(__dirname, '../../ui')))

app.use(express.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.text());
app.use(bodyParser.raw());

app.use(cors({
    "origin": "*"
}));
app.use(function (req, res, next) {
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
    next();
});

app.post("/animate", async (req: any, res: any, next: any) => {
    let body = req.body;
    main(body)
        .then((result) => res.send(result))
        .catch(e => {
            console.error(e);
            res.header.add();
            res.send("An error occured")
        }).finally(async () => await next())
});
app.get("/", async (req: any, res: any, next: any) => {
    res.send("<script>location.href = location.origin + '/static/html/'</script>");
    next()
});

app.listen(PORT, () => {
    console.log(`Server is listening on port ${PORT}`);
});