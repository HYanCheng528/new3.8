require('dotenv').config();
const express = require('express');
const cors = require('cors');
const axios = require('axios');
const app = express();

app.use(cors());
app.use(express.json());
app.use(express.static('.'));

// 检查API密钥是否存在
if (!process.env.API_KEY) {
    console.error('错误: 未设置API_KEY环境变量');
    process.exit(1);
}

app.post('/api/generate-blessing', async (req, res) => {
    try {
        const response = await axios.post('https://ark.cn-beijing.volces.com/api/v3/chat/completions', req.body, {
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${process.env.API_KEY}`
            },
            timeout: 30000 // 降低超时时间到30秒
        });
        res.json(response.data);
    } catch (error) {
        console.error('API Error:', error.message);
        // 根据错误类型返回不同的状态码和错误信息
        if (error.code === 'ECONNABORTED') {
            res.status(504).json({ error: '请求超时，请稍后重试' });
        } else if (error.response) {
            res.status(error.response.status).json({ error: error.response.data.error || '服务器响应错误' });
        } else {
            res.status(500).json({ error: '服务器内部错误' });
        }
    }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`服务器运行在 http://localhost:${PORT}`);
});