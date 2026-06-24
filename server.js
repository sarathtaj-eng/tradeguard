const express = require('express');
const app = express();

app.get('/', (req,res)=>{
    res.send('TradeGuard API Running');
});

app.get('/clients',(req,res)=>{
    res.json([
        {id:1,name:'Client A'},
        {id:2,name:'Client B'}
    ]);
});

const PORT = process.env.PORT || 3000;

app.listen(PORT,()=>{
    console.log('Server Started');
});
