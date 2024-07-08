import React, { useEffect, useState, useCallback } from 'react';
import { Bar } from 'react-chartjs-2';
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend } from 'chart.js';
import { getEntries, getExits, getArticles, getClients } from '../services/api';
import { Form, Col, Row, Button, Collapse } from 'react-bootstrap';
import moment from 'moment';

// Registrar los componentes necesarios
ChartJS.register(
    CategoryScale,
    LinearScale,
    BarElement,
    Title,
    Tooltip,
    Legend
);

const StockChart = () => {
    const [data, setData] = useState(null);
    const [articles, setArticles] = useState([]);
    const [clients, setClients] = useState([]);
    const [selectedArticle, setSelectedArticle] = useState('');
    const [selectedClient, setSelectedClient] = useState('');
    const [dateRange, setDateRange] = useState({ start: '', end: '' });
    const [chartType, setChartType] = useState('entries'); // 'entries', 'exits', or 'both'
    const [xAxisGrouping, setXAxisGrouping] = useState('articles'); // 'articles', 'clients', 'dates'
    const [dateGrouping, setDateGrouping] = useState('daily'); // 'daily', 'biweekly', 'monthly', 'yearly'
    const [open, setOpen] = useState(false); // Estado de colapso

    const processChartData = useCallback((entries, exits) => {
        let filteredEntries = entries;
        let filteredExits = exits;

        if (selectedArticle) {
            filteredEntries = filteredEntries.filter(entry => entry.article === parseInt(selectedArticle));
            filteredExits = filteredExits.filter(exit => exit.article === parseInt(selectedArticle));
        }

        if (selectedClient) {
            filteredEntries = filteredEntries.filter(entry => entry.client === parseInt(selectedClient));
            filteredExits = filteredExits.filter(exit => exit.client === parseInt(selectedClient));
        }

        if (dateRange.start && dateRange.end) {
            filteredEntries = filteredEntries.filter(entry => entry.date >= dateRange.start && entry.date <= dateRange.end);
            filteredExits = filteredExits.filter(exit => exit.date >= dateRange.start && exit.date <= dateRange.end);
        }

        const labels = [];
        const entryData = [];
        const exitData = [];

        if (xAxisGrouping === 'articles') {
            const articlesMap = new Map();
            articles.forEach(article => {
                articlesMap.set(article.id, { name: article.name, entryCount: 0, exitCount: 0 });
            });

            filteredEntries.forEach(entry => {
                if (articlesMap.has(entry.article)) {
                    articlesMap.get(entry.article).entryCount += entry.quantity;
                }
            });

            filteredExits.forEach(exit => {
                if (articlesMap.has(exit.article)) {
                    articlesMap.get(exit.article).exitCount += exit.quantity;
                }
            });

            articlesMap.forEach((value, key) => {
                labels.push(value.name);
                entryData.push(value.entryCount);
                exitData.push(value.exitCount);
            });

        } else if (xAxisGrouping === 'clients') {
            const clientsMap = new Map();
            clients.forEach(client => {
                clientsMap.set(client.id, { name: client.name, entryCount: 0, exitCount: 0 });
            });

            filteredEntries.forEach(entry => {
                if (clientsMap.has(entry.client)) {
                    clientsMap.get(entry.client).entryCount += entry.quantity;
                }
            });

            filteredExits.forEach(exit => {
                if (clientsMap.has(exit.client)) {
                    clientsMap.get(exit.client).exitCount += exit.quantity;
                }
            });

            clientsMap.forEach((value, key) => {
                labels.push(value.name);
                entryData.push(value.entryCount);
                exitData.push(value.exitCount);
            });
        } else if (xAxisGrouping === 'dates') {
            const datesMap = new Map();

            const addToMap = (date, type, quantity) => {
                let key;
                if (dateGrouping === 'yearly') {
                    key = moment(date).format('YYYY');
                } else if (dateGrouping === 'monthly') {
                    key = moment(date).format('YYYY-MM');
                } else if (dateGrouping === 'biweekly') {
                    const week = moment(date).week();
                    const year = moment(date).year();
                    key = `${year}-W${Math.ceil(week / 2)}`;
                } else {
                    key = moment(date).format('YYYY-MM-DD');
                }

                if (!datesMap.has(key)) {
                    datesMap.set(key, { entryCount: 0, exitCount: 0 });
                }
                datesMap.get(key)[type] += quantity;
            };

            filteredEntries.forEach(entry => {
                addToMap(entry.date, 'entryCount', entry.quantity);
            });

            filteredExits.forEach(exit => {
                addToMap(exit.date, 'exitCount', exit.quantity);
            });

            const sortedDates = Array.from(datesMap.keys()).sort();

            sortedDates.forEach(key => {
                labels.push(key);
                entryData.push(datesMap.get(key).entryCount);
                exitData.push(datesMap.get(key).exitCount);
            });
        }

        const datasets = [];

        if (chartType === 'entries' || chartType === 'both') {
            datasets.push({
                label: 'Entradas',
                data: entryData,
                backgroundColor: 'rgba(75, 192, 192, 0.6)',
            });
        }

        if (chartType === 'exits' || chartType === 'both') {
            datasets.push({
                label: 'Salidas',
                data: exitData,
                backgroundColor: 'rgba(255, 99, 132, 0.6)',
            });
        }

        setData({
            labels,
            datasets
        });
    }, [selectedArticle, selectedClient, dateRange, xAxisGrouping, dateGrouping, chartType, articles, clients]);

    const fetchData = async () => {
        try {
            console.log('Fetching data...');
            const [entriesResponse, exitsResponse, articlesResponse, clientsResponse] = await Promise.all([
                getEntries(),
                getExits(),
                getArticles(),
                getClients()
            ]);

            const sortedArticles = articlesResponse.data.sort((a, b) => a.name.localeCompare(b.name));
            setArticles(sortedArticles || []);
            setClients(clientsResponse.data || []);

            processChartData(entriesResponse.data || [], exitsResponse.data || []);
        } catch (error) {
            console.error('Error fetching data:', error);
        }
    };

    useEffect(() => {
        fetchData();
    }, []);

    const handleFilterChange = () => {
        fetchData();
    };

    // Mostrar un mensaje de carga mientras se cargan los datos
    if (!data) {
        return <div>Loading...</div>;
    }

    return (
        <div className="section-card">
            <h5 onClick={() => setOpen(!open)}
                aria-controls="chart-collapse"
                aria-expanded={open}
                style={{ cursor: 'pointer' }}>
                Visor de gráficos
            </h5>
            <Collapse in={open}>
                <div id="chart-collapse" className="chart-section">
                    <Form>
                        <Row className="mb-3">
                            <Col>
                                <Form.Group controlId="articleSelect">
                                    <Form.Label>Artículo</Form.Label>
                                    <Form.Control as="select" value={selectedArticle} onChange={e => setSelectedArticle(e.target.value)}>
                                        <option value="">Seleccionar artículo</option>
                                        {articles.map(article => (
                                            <option key={article.id} value={article.id}>{article.name}</option>
                                        ))}
                                    </Form.Control>
                                </Form.Group>
                            </Col>
                            <Col>
                                <Form.Group controlId="clientSelect">
                                    <Form.Label>Cliente</Form.Label>
                                    <Form.Control as="select" value={selectedClient} onChange={e => setSelectedClient(e.target.value)}>
                                        <option value="">Seleccionar cliente</option>
                                        {clients.map(client => (
                                            <option key={client.id} value={client.id}>{client.name}</option>
                                        ))}
                                    </Form.Control>
                                </Form.Group>
                            </Col>
                        </Row>
                        <Row className="mb-3">
                            <Col>
                                <Form.Group controlId="startDate">
                                    <Form.Label>Fecha de Inicio</Form.Label>
                                    <Form.Control type="date" value={dateRange.start} onChange={e => setDateRange({ ...dateRange, start: e.target.value })} />
                                </Form.Group>
                            </Col>
                            <Col>
                                <Form.Group controlId="endDate">
                                    <Form.Label>Fecha de Fin</Form.Label>
                                    <Form.Control type="date" value={dateRange.end} onChange={e => setDateRange({ ...dateRange, end: e.target.value })} />
                                </Form.Group>
                            </Col>
                        </Row>
                        <Row className="mb-3">
                            <Col>
                                <Form.Group controlId="chartType">
                                    <Form.Label>Tipo de Gráfico</Form.Label>
                                    <Form.Control as="select" value={chartType} onChange={e => setChartType(e.target.value)}>
                                        <option value="entries">Entradas</option>
                                        <option value="exits">Salidas</option>
                                        <option value="both">Ambos</option>
                                    </Form.Control>
                                </Form.Group>
                            </Col>
                            <Col>
                                <Form.Group controlId="xAxisGrouping">
                                    <Form.Label>Agrupar por</Form.Label>
                                    <Form.Control as="select" value={xAxisGrouping} onChange={e => setXAxisGrouping(e.target.value)}>
                                        <option value="articles">Artículos</option>
                                        <option value="clients">Clientes</option>
                                        <option value="dates">Fechas</option>
                                    </Form.Control>
                                </Form.Group>
                            </Col>
                            {xAxisGrouping === 'dates' && (
                                <Col>
                                    <Form.Group controlId="dateGrouping">
                                        <Form.Label>Periodo de Agrupación</Form.Label>
                                        <Form.Control as="select" value={dateGrouping} onChange={e => setDateGrouping(e.target.value)}>
                                            <option value="daily">Diario</option>
                                            <option value="biweekly">Quincenal</option>
                                            <option value="monthly">Mensual</option>
                                            <option value="yearly">Anual</option>
                                        </Form.Control>
                                    </Form.Group>
                                </Col>
                            )}
                        </Row>
                        <Button variant="primary" onClick={handleFilterChange}>Actualizar Gráfico</Button>
                    </Form>
                    <Bar data={data} />
                </div>
            </Collapse>
        </div>
    );
};

export default StockChart;
