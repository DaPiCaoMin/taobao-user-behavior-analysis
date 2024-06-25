import {fetchData} from './dataService.js'; // 引入自定义的数据服务模块，用于获取数据

// 获取图表 DOM 节点
const chartDom0 = document.getElementById('dailyChart'); // 获取每日用户行为统计图表的 DOM 节点
const chartDom1 = document.getElementById('hourlyChart'); // 获取分时用户行为统计图表的 DOM 节点
const chartDom2 = document.getElementById('clickChart'); // 获取点击Top10图表的 DOM 节点
const chartDom3 = document.getElementById('purchaseChart'); // 获取购买Top10图表的 DOM 节点

// 初始化 ECharts 图表实例
let charts = {
    dailyChart: echarts.init(chartDom0), // 初始化每日用户行为统计图表
    hourlyChart: echarts.init(chartDom1), // 初始化分时用户行为统计图表
    clickChart: echarts.init(chartDom2), // 初始化点击Top10图表
    purchaseChart: echarts.init(chartDom3) // 初始化购买Top10图表
};

// 函数用于处理后端返回的数据并渲染图表
function renderCharts(data) {
    console.log("Rendering charts with data:", data); // 打印调试信息，显示接收到的数据

    // 1. 获取数据
    const dailyChartData = data.dailyChartData; // 获取每日用户行为统计数据
    const hourlyChartData = data.hourlyChartData; // 获取分时用户行为统计数据
    const clickChartData = data.clickChartData; // 获取点击Top10数据
    const purchaseChartData = data.purchaseChartData; // 获取购买Top10数据

    // 2. 设置指定的日期范围
    const startDate = '2017-11-24'; // 设置开始日期
    const endDate = '2017-12-03'; // 设置结束日期

    // 3. 找到范围内数据的索引
    const startIndex = dailyChartData.xAxisData.indexOf(startDate); // 找到开始日期在数据中的索引
    const endIndex = dailyChartData.xAxisData.indexOf(endDate) + 1; // 找到结束日期在数据中的索引（加1以包含结束日期）

    // 4. 过滤范围内的数据
    const filteredData = {
        xAxisData: dailyChartData.xAxisData.slice(startIndex, endIndex), // 过滤X轴数据
        clickData: dailyChartData.clickData.slice(startIndex, endIndex), // 过滤点击数据
        purchaseData: dailyChartData.purchaseData.slice(startIndex, endIndex), // 过滤购买数据
        cartData: dailyChartData.cartData.slice(startIndex, endIndex), // 过滤购物车数据
        favData: dailyChartData.favData.slice(startIndex, endIndex) // 过滤收藏数据
    };

    // 5. 更新图表配置
    const option1 = {
        title: {text: '每日用户行为统计'}, // 图表标题
        tooltip: {}, // 提示框
        legend: {data: ['点击', '购买', '购物车', '收藏']}, // 图例
        xAxis: {
            type: 'category',
            data: filteredData.xAxisData,
            axisLabel: {
                interval: 1 // 每隔一个标签显示一次
            }
        },
        yAxis: {type: 'value'}, // Y轴为数值轴
        series: [
            {
                name: '点击',
                data: filteredData.clickData,
                type: 'line',
                animationDuration: 2000, // 动画持续时间
                animationEasing: 'cubicOut', // 动画缓动效果
                animationDelay: (idx) => idx * 100 // 动画延迟
            },
            {
                name: '购买',
                data: filteredData.purchaseData,
                type: 'line',
                animationDuration: 2000,
                animationEasing: 'cubicOut',
                animationDelay: (idx) => idx * 100
            },
            {
                name: '购物车',
                data: filteredData.cartData,
                type: 'line',
                animationDuration: 2000,
                animationEasing: 'cubicOut',
                animationDelay: (idx) => idx * 100
            },
            {
                name: '收藏',
                data: filteredData.favData,
                type: 'line',
                animationDuration: 2000,
                animationEasing: 'cubicOut',
                animationDelay: (idx) => idx * 100
            }
        ]
    };

    const option2 = {
        title: {text: '分时用户行为统计'}, // 图表标题
        tooltip: {}, // 提示框
        legend: {data: ['点击', '购买']}, // 图例
        xAxis: {
            type: 'category',
            data: hourlyChartData.xAxisData,
            axisLabel: {
                interval: 1 // 每隔一个标签显示一次
            }
        },
        yAxis: {type: 'value'}, // Y轴为数值轴
        series: [
            {
                name: '点击',
                data: hourlyChartData.clickData,
                type: 'line',
                animationDuration: 2000, // 动画持续时间
                animationEasing: 'cubicOut', // 动画缓动效果
                animationDelay: (idx) => idx * 100 // 动画延迟
            },
            {
                name: '购买',
                data: hourlyChartData.purchaseData,
                type: 'line',
                animationDuration: 2000,
                animationEasing: 'cubicOut',
                animationDelay: (idx) => idx * 100
            }
        ]
    };

    const option3 = {
        title: {text: '点击Top10'}, // 图表标题
        tooltip: {}, // 提示框
        xAxis: {
            type: 'category',
            data: clickChartData.xAxisData,
            axisLabel: {
                interval: 0 // 每个标签都显示
            }
        },
        yAxis: {type: 'value'}, // Y轴为数值轴
        series: [{
            name: '点击次数',
            data: clickChartData.seriesData,
            type: 'bar',
            itemStyle: {
                color: function (params) {
                    const colors = ['#5470C6', '#91CC75', '#EE6666', '#73C0DE', '#3BA272', '#FC8452', '#9A60B4', '#EA7CCC', '#3E92CC', '#F4A460'];
                    return colors[params.dataIndex % colors.length]; // 根据索引设置不同颜色
                }
            },
            barWidth: '20%', // 柱状图宽度
            animationDuration: 2000, // 动画持续时间
            animationEasing: 'elasticOut', // 动画缓动效果
            animationDelay: (idx) => idx * 100 // 动画延迟
        }]
    };

    const option4 = {
        title: {text: '购买Top10'}, // 图表标题
        tooltip: {}, // 提示框
        xAxis: {
            type: 'category',
            data: purchaseChartData.xAxisData,
            axisLabel: {
                interval: 0 // 每个标签都显示
            }
        },
        yAxis: {type: 'value'}, // Y轴为数值轴
        series: [{
            name: '购买次数',
            data: purchaseChartData.seriesData,
            type: 'bar',
            itemStyle: {
                color: function (params) {
                    const colors = ['#5470C6', '#91CC75', '#EE6666', '#73C0DE', '#3BA272', '#FC8452', '#9A60B4', '#EA7CCC', '#3E92CC', '#F4A460'];
                    return colors[params.dataIndex % colors.length]; // 根据索引设置不同颜色
                }
            },
            barWidth: '20%', // 柱状图宽度
            animationDuration: 2000, // 动画持续时间
            animationEasing: 'elasticOut', // 动画缓动效果
            animationDelay: (idx) => idx * 100 // 动画延迟
        }]
    };

    // 设置图表选项并添加过渡动画
    charts.dailyChart.setOption(option1); // 设置每日用户行为统计图表选项
    charts.hourlyChart.setOption(option2); // 设置分时用户行为统计图表选项
    charts.clickChart.setOption(option3); // 设置点击Top10图表选项
    charts.purchaseChart.setOption(option4); // 设置购买Top10图表选项

    // 添加过渡动画效果
    setTimeout(() => {
        charts.dailyChart.hideLoading(); // 隐藏每日用户行为统计图表的加载动画
        charts.hourlyChart.hideLoading(); // 隐藏分时用户行为统计图表的加载动画
        charts.clickChart.hideLoading(); // 隐藏点击Top10图表的加载动画
        charts.purchaseChart.hideLoading(); // 隐藏购买Top10图表的加载动画
    }, 300); // 设置延迟时间，确保图表渲染完毕后再移除 loading 效果
}

// 重新初始化图表实例以触发加载动画和逐点绘制效果
function reinitializeCharts() {
    Object.keys(charts).forEach(key => {
        charts[key].dispose(); // 销毁当前图表实例
        charts[key] = echarts.init(document.getElementById(key)); // 重新初始化图表实例
    });
}

// 获取后端数据并渲染图表
function updateCharts() {
    fetchData('/api/chartData') // 调用 fetchData 函数获取数据
        .then(data => {
            reinitializeCharts(); // 重新初始化图表实例以触发加载动画和逐点绘制效果
            renderCharts(data); // 调用渲染图表的函数，并传入从后端获取的数据
        })
        .catch(error => {
            console.error('Error fetching chart data:', error); // 捕获并打印获取数据过程中的错误
        });
}

// 添加过渡动画
function animateChart(chartDom, show = true) {
    chartDom.style.transition = 'opacity 0.5s'; // 设置过渡效果
    chartDom.style.opacity = show ? 1 : 0; // 根据 show 参数设置透明度
}

// 防抖处理函数，避免频繁触发函数
function debounce(func, wait) {
    let timeout; // 定义一个定时器变量
    return function (...args) {
        clearTimeout(timeout); // 每次调用时清除上一次的定时器
        timeout = setTimeout(() => func.apply(this, args), wait); // 重新设置定时器
    };
}

// 按钮事件监听器
document.getElementById("overviewBtn").addEventListener("click", debounce(function () {
    showAllCharts(); // 调用显示所有图表的函数
}, 300));

document.getElementById("timeBtn").addEventListener("click", debounce(function () {
    hideAllCharts(); // 调用隐藏所有图表的函数
    setTimeout(() => {
        [chartDom0, chartDom1].forEach(dom => {
            dom.style.display = 'block'; // 显示指定的图表
            animateChart(dom, true); // 触发显示动画
        });
        updateCharts(); // 更新图表
    }, 500); // 设置延迟时间，确保图表隐藏动画完成后再显示新图表
}, 300));

document.getElementById("top10Btn").addEventListener("click", debounce(function () {
    hideAllCharts(); // 调用隐藏所有图表的函数
    setTimeout(() => {
        [chartDom2, chartDom3].forEach(dom => {
            dom.style.display = 'block'; // 显示指定的图表
            animateChart(dom, true); // 触发显示动画
        });
        updateCharts(); // 更新图表
    }, 500); // 设置延迟时间，确保图表隐藏动画完成后再显示新图表
}, 300));

// 隐藏所有图表并显示加载动画
function hideAllCharts() {
    Object.values(charts).forEach(chart => chart.showLoading()); // 显示所有图表的加载动画
    setTimeout(() => {
        [chartDom0, chartDom1, chartDom2, chartDom3].forEach(dom => animateChart(dom, false)); // 触发隐藏动画
    }, 300); // 设置延迟时间，确保 loading 效果显示出来
}

// 显示所有图表并触发动画效果和更新
function showAllCharts() {
    Object.values(charts).forEach(chart => chart.showLoading()); // 显示所有图表的加载动画
    setTimeout(() => {
        [chartDom0, chartDom1, chartDom2, chartDom3].forEach(dom => {
            dom.style.display = 'block'; // 显示所有图表
            animateChart(dom, true); // 触发显示动画
        });
        updateCharts(); // 更新图表
    }, 500); // 设置延迟时间，确保图表隐藏动画完成后再显示新图表
}
