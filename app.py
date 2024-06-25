#!/usr/bin/env python
# -*- coding: utf-8 -*-
"""
Project: taobao-user-behavior-analysis
Description: This script/module is part of the Taobao user behavior analysis project.
Author: DaPiCaoMin
Date: 2024/6/25
"""
import os
import time

import pandas as pd
from flask import Flask, jsonify, render_template, request
from flask_caching import Cache
from flask_cors import CORS
from sqlalchemy import create_engine

# 创建 Flask 应用
app = Flask(__name__)
CORS(app)  # 允许跨域请求

# 配置缓存
cache = Cache(app, config={'CACHE_TYPE': 'simple'})

# 从环境变量中获取数据库连接信息，默认值为 'root'
username = os.getenv('DB_USERNAME', 'root')
password = os.getenv('DB_PASSWORD', 'root')
host = os.getenv('DB_HOST', 'localhost')
port = os.getenv('DB_PORT', 3306)

# 创建数据库引擎
engine = create_engine(f'mysql+pymysql://{username}:{password}@{host}:{port}/user_data')


# 预处理数据并存储到 CSV 文件
def preprocess_and_save_to_csv():
    try:
        # 连接到数据库并读取 'user_behavior' 表的数据
        with engine.connect() as conn:
            data = pd.read_sql('SELECT * FROM user_behavior', conn)

        # 按日期分组并汇总各类行为的数据
        daily_data = data.groupby('Date').agg({
            'Behavior_pv': 'sum',
            'Behavior_buy': 'sum',
            'Behavior_cart': 'sum',
            'Behavior_fav': 'sum'
        }).reset_index()
        daily_data.to_csv('data/daily_behavior.csv', index=False)

        # 按小时分组并汇总浏览和购买行为的数据
        hourly_data = data.groupby('Hour').agg({
            'Behavior_pv': 'sum',
            'Behavior_buy': 'sum'
        }).reset_index()
        hourly_data.to_csv('data/hourly_behavior.csv', index=False)

        # 按商品 ID 分组并汇总点击行为的数据，取点击数前 10 的商品
        top_click_items = data.groupby('ItemID')['Behavior_pv'].sum().reset_index().sort_values(by='Behavior_pv',
                                                                                                ascending=False).head(
            10)
        top_click_items.to_csv('data/top_click_items.csv', index=False)

        # 按商品 ID 分组并汇总购买行为的数据，取购买数前 10 的商品
        top_purchase_items = data.groupby('ItemID')['Behavior_buy'].sum().reset_index().sort_values(by='Behavior_buy',
                                                                                                    ascending=False).head(
            10)
        top_purchase_items.to_csv('data/top_purchase_items.csv', index=False)

        # 汇总数据概览信息
        summary_data = {
            'user_count': data['UserID'].nunique(),
            'item_count': data['ItemID'].nunique(),
            'category_count': data['CategoryID'].nunique(),
            'click_count': data['Behavior_pv'].sum(),
            'purchase_count': data['Behavior_buy'].sum(),
            'cart_count': data['Behavior_cart'].sum(),
            'fav_count': data['Behavior_fav'].sum()
        }
        pd.DataFrame([summary_data]).to_csv('data/summary_data.csv', index=False)

    except Exception as e:
        print(f"Error processing data: {e}")


@app.route('/')
def index():
    # 从 CSV 文件中读取数据概要
    summary_data = pd.read_csv('data/summary_data.csv').iloc[0].to_dict()
    return render_template('index.html', data_summary=summary_data)


@cache.cached(timeout=3600, key_prefix='chart_data')
@app.route('/api/chartData', methods=['GET'])
def chart_data():
    # 获取分页参数，默认值分别为第 1 页，每页 1000 条数据
    page = int(request.args.get('page', 1))
    page_size = int(request.args.get('page_size', 1000))
    offset = (page - 1) * page_size

    # 从 CSV 文件中读取数据
    daily_data = pd.read_csv('data/daily_behavior.csv')
    hourly_data = pd.read_csv('data/hourly_behavior.csv')
    top_click_items = pd.read_csv('data/top_click_items.csv')
    top_purchase_items = pd.read_csv('data/top_purchase_items.csv')

    time.sleep(2)  # 模拟数据处理延迟

    # 分页处理数据
    daily_page = daily_data[offset:offset + page_size]
    hourly_page = hourly_data[offset:offset + page_size]

    # 准备按日期分组的图表数据
    daily_chart_data = {
        'xAxisData': daily_page['Date'].astype(str).tolist(),
        'clickData': daily_page['Behavior_pv'].tolist(),
        'purchaseData': daily_page['Behavior_buy'].tolist(),
        'cartData': daily_page['Behavior_cart'].tolist(),
        'favData': daily_page['Behavior_fav'].tolist()
    }

    # 准备按小时分组的图表数据
    hourly_chart_data = {
        'xAxisData': hourly_page['Hour'].tolist(),
        'clickData': hourly_page['Behavior_pv'].tolist(),
        'purchaseData': hourly_page['Behavior_buy'].tolist()
    }

    # 准备点击前 10 商品的图表数据
    click_chart_data = {
        'xAxisData': top_click_items['ItemID'].tolist(),
        'seriesData': top_click_items['Behavior_pv'].tolist()
    }

    # 准备购买前 10 商品的图表数据
    purchase_chart_data = {
        'xAxisData': top_purchase_items['ItemID'].tolist(),
        'seriesData': top_purchase_items['Behavior_buy'].tolist()
    }

    # 汇总所有图表数据
    result = {
        'dailyChartData': daily_chart_data,
        'hourlyChartData': hourly_chart_data,
        'clickChartData': click_chart_data,
        'purchaseChartData': purchase_chart_data
    }

    # 返回 JSON 格式的响应
    return jsonify(result)


# 启动 Flask 应用
if __name__ == '__main__':
    # 仅在数据文件不存在时进行数据预处理
    if not os.path.exists('data/daily_behavior.csv'):
        preprocess_and_save_to_csv()
    app.run(debug=True)
