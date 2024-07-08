import React, { useEffect, useState } from 'react';
import { getArticles } from '../services/api';

const ArticleList = () => {
    const [articles, setArticles] = useState([]);

    useEffect(() => {
        getArticles().then(response => {
            console.log("Articles: ", response.data);
            setArticles(response.data || []);
        }).catch(error => {
            console.error('Error fetching articles:', error);
        });
    }, []);

    return (
        <div>
            <h2>Articles</h2>
            <p>{articles.length} articles loaded.</p>
            <ul>
                {articles.map(article => (
                    <li key={article.id}>{article.name} - {article.description}</li>
                ))}
            </ul>
        </div>
    );
};

export default ArticleList;
