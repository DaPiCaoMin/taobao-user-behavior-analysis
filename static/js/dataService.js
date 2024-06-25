// 函数用于发起HTTP请求并获取数据
async function fetchData(url) {
    try {
        const response = await fetch(url);  // 发起异步请求，等待响应
        if (!response.ok) {  // 如果响应状态不为 200-299，则抛出错误
            throw new Error('Network response was not ok ' + response.statusText);
        }
        const data = await response.json();  // 解析响应体为 JSON 格式
        console.log('Data fetched:', data);  // 打印获取的数据，用于调试和验证
        return data;  // 返回解析后的数据对象
    } catch (error) {
        console.error('There was a problem with the fetch operation:', error);  // 捕获并打印发生的错误
        throw error;  // 抛出错误，传播给调用方处理
    }
}

// 导出函数供其他模块使用
export {fetchData};
