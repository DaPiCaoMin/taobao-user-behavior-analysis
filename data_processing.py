#!/usr/bin/env python
# -*- coding: utf-8 -*-
"""
Project: taobao-user-behavior-analysis
Description: This script/module is part of the Taobao user behavior analysis project.
Author: DaPiCaoMin
Date: 2024/6/25
"""
import logging

import pandas as pd
from sqlalchemy import create_engine

# 配置日志
logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(levelname)s - %(message)s')

# 读取数据
try:
    data = pd.read_csv('data/user_data.csv', header=None,
                       names=['UserID', 'ItemID', 'CategoryID', 'BehaviorType', 'Timestamp'])
    logging.info("数据读取成功。")
except Exception as e:
    logging.error(f"数据读取失败: {e}")
    raise

# 数据清洗
data.dropna(inplace=True)
data.drop_duplicates(inplace=True)

# 转换时间戳
data['Timestamp'] = pd.to_datetime(data['Timestamp'], unit='s', errors='coerce')
data.dropna(subset=['Timestamp'], inplace=True)

# 查看最早和最晚的五个时间戳
logging.info("最早的5个时间戳:\n%s", data['Timestamp'].sort_values().head(5))
logging.info("最晚的5个时间戳:\n%s", data['Timestamp'].sort_values().tail(5))

# 处理异常时间戳，设定合理的时间范围
start_date = pd.Timestamp('2017-07-03')
data = data[data['Timestamp'] >= start_date]

# 数据转换
data['Date'] = data['Timestamp'].dt.date
data['Hour'] = data['Timestamp'].dt.hour
data['Weekday'] = data['Timestamp'].dt.weekday

# 处理无效的用户ID和商品ID
data = data[(data['UserID'] > 0) & (data['ItemID'] > 0)]

# 独热编码处理行为类型
behavior_types = ['pv', 'buy', 'cart', 'fav']
for behavior in behavior_types:
    data[f'Behavior_{behavior}'] = (data['BehaviorType'] == behavior).astype(int)

# 确认列名
logging.info("列名:\n%s", data.columns)

# 特征工程
user_behavior = data.groupby('UserID').agg({
    'Behavior_buy': 'sum',
    'Behavior_fav': 'sum',
    'Behavior_cart': 'sum',
    'Behavior_pv': 'sum'
}).reset_index()

user_behavior.columns = ['UserID', 'BuyCount', 'FavCount', 'CartCount', 'PvCount']

# 添加购买行为比例
user_behavior['BuyRatio'] = user_behavior['BuyCount'] / user_behavior['PvCount']
user_behavior['BuyRatio'].fillna(0, inplace=True)

# 将特征合并回原数据
data = pd.merge(data, user_behavior, on='UserID', how='left')

# 确保所有列的类型可以被SQLAlchemy支持
data = data.convert_dtypes()

# 替换无穷大值和无穷小值
data.replace([float('inf'), float('-inf')], None, inplace=True)

# 数据库连接信息
username = 'root'
password = 'root'
host = 'localhost'
port = 3306

# 创建数据库连接
try:
    engine = create_engine(f'mysql+pymysql://{username}:{password}@{host}:{port}/mysql')
    with engine.connect() as conn:
        conn.execute("CREATE DATABASE IF NOT EXISTS user_data")
    logging.info("数据库创建成功。")
except Exception as e:
    logging.error(f"数据库创建失败: {e}")
    raise

# 连接到新创建的数据库
engine = create_engine(f'mysql+pymysql://{username}:{password}@{host}:{port}/user_data')

# 将数据写入数据库
try:
    with engine.begin() as connection:
        data.to_sql('user_behavior', con=connection, if_exists='replace', index=False)
    logging.info("数据清洗完成，并保存到数据库 user_data 中的表 user_behavior。")
except Exception as e:
    logging.error(f"数据写入失败: {e}")
    raise
