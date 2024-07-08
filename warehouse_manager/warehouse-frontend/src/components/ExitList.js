import React, { useEffect, useState } from 'react';
import { getExits, createMultipleExits, getArticles, getClients } from '../services/api';
import { Collapse } from 'react-bootstrap';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faSearch, faSyncAlt, faPlus, faMinus, faCircleCheck } from '@fortawesome/free-solid-svg-icons';

const ExitList = () => {
    const [exits, setExits] = useState([]);
    const [filteredExits, setFilteredExits] = useState([]);
    const [articles, setArticles] = useState([]);
    const [clients, setClients] = useState([]);
    const [client, setClient] = useState('');
    const [date, setDate] = useState('');
    const [lines, setLines] = useState([{ article: '', quantity: '' }]);
    const [filterClient, setFilterClient] = useState('');
    const [filterStartDate, setFilterStartDate] = useState('');
    const [filterEndDate, setFilterEndDate] = useState('');
    const [successMessage, setSuccessMessage] = useState('');
    const [openSearch, setOpenSearch] = useState(false);
    const [openAdd, setOpenAdd] = useState(false);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        fetchArticles();
        fetchClients();
        fetchExits();
    }, []);

    const fetchExits = async () => {
        try {
            const response = await getExits();
            console.log("Exits: ", response.data);
            setExits(response.data.filter(exit => exit.is_authorized) || []);
        } catch (error) {
            console.error('Error fetching exits:', error);
        }
    };

    const fetchArticles = async () => {
        try {
            const response = await getArticles();
            console.log("Articles: ", response.data);
            const sortedArticles = response.data.sort((a, b) => a.name.localeCompare(b.name));
            setArticles(sortedArticles || []);
        } catch (error) {
            console.error('Error fetching articles:', error);
        }
    };

    const fetchClients = async () => {
        try {
            const response = await getClients();
            console.log("Clients: ", response.data);
            setClients(response.data || []);
        } catch (error) {
            console.error('Error fetching clients:', error);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            const exitData = {
                client: parseInt(client),
                date,
                articles: lines.map(line => ({
                    article: line.article,
                    quantity: line.quantity,
                })),
            };
            await createMultipleExits(exitData);
            setSuccessMessage('Salidas añadidas con éxito y en espera de autorización.');
            setClient('');
            setDate('');
            setLines([{ article: '', quantity: '' }]);
            setTimeout(() => {
                setSuccessMessage('');
            }, 3000);
            fetchExits();
        } catch (error) {
            console.error('Error creating exit:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleFilter = () => {
        let filtered = exits;

        if (filterClient) {
            filtered = filtered.filter(exit => exit.client.toString() === filterClient);
        }

        if (filterStartDate && filterEndDate) {
            filtered = filtered.filter(exit => exit.date >= filterStartDate && exit.date <= filterEndDate);
        }

        setFilteredExits(filtered.map(exit => ({
            ...exit,
            articleName: getArticleName(exit.article)
        })));
    };

    const getArticleName = (articleId) => {
        const article = articles.find(a => a.id === articleId);
        return article ? article.name : 'Desconocido';
    };

    const resetFilters = () => {
        setFilterClient('');
        setFilterStartDate('');
        setFilterEndDate('');
        setFilteredExits([]);
    };

    const handleLineChange = (index, field, value) => {
        const newLines = [...lines];
        newLines[index][field] = value;
        setLines(newLines);
    };

    const addLine = () => {
        setLines([...lines, { article: '', quantity: '' }]);
    };

    const removeLine = (index) => {
        const newLines = lines.filter((_, i) => i !== index);
        setLines(newLines);
    };

    return (
        <div className="section container">
            <div className="section-card mb-4">
                <h5 onClick={() => setOpenSearch(!openSearch)}
                    aria-controls="search-collapse"
                    aria-expanded={openSearch}
                    style={{ cursor: 'pointer' }}>
                    Buscador de salidas del almacén
                </h5>
                <Collapse in={openSearch}>
                    <div id="search-collapse">
                        <div className="filters-container row justify-content-center">
                            <div className="col-md-4">
                                <select className="form-control" value={filterClient} onChange={e => setFilterClient(e.target.value)}>
                                    <option value="">Seleccionar cliente</option>
                                    {clients.map(client => (
                                        <option key={client.id} value={client.id}>
                                            {client.name}
                                        </option>
                                    ))}
                                </select>
                            </div>
                            <div className="col-md-3">
                                <input 
                                    type="date" 
                                    className="form-control" 
                                    placeholder="Desde" 
                                    value={filterStartDate} 
                                    onChange={e => setFilterStartDate(e.target.value)} 
                                />
                            </div>
                            <div className="col-md-3">
                                <input 
                                    type="date" 
                                    className="form-control" 
                                    placeholder="Hasta" 
                                    value={filterEndDate} 
                                    onChange={e => setFilterEndDate(e.target.value)} 
                                />
                            </div>
                            <div className="col-md-2">
                                <button className="btn btn-primary" onClick={handleFilter} title='Iniciar búsqueda'>
                                    <FontAwesomeIcon icon={faSearch} title="Iniciar búsqueda" />
                                </button>
                                <button className="btn btn-secondary ml-2" onClick={resetFilters} title='Resetear campos'>
                                    <FontAwesomeIcon icon={faSyncAlt} title="Reset" />
                                </button>
                            </div>
                        </div>
                        {filteredExits.length > 0 && (
                            <table className="styled-table table table-striped mt-4">
                                <thead>
                                    <tr>
                                        <th>Artículo</th>
                                        <th>Cliente</th>
                                        <th>Cantidad</th>
                                        <th>Fecha</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {filteredExits.map(exit => (
                                        <tr key={exit.id}>
                                            <td>{exit.articleName}</td>
                                            <td>{clients.find(client => client.id === exit.client)?.name}</td>
                                            <td>{exit.quantity}</td>
                                            <td>{exit.date}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        )}
                    </div>
                </Collapse>
            </div>
            
            <div className="section-card">
                <h5 onClick={() => setOpenAdd(!openAdd)}
                    aria-controls="add-collapse"
                    aria-expanded={openAdd}
                    style={{ cursor: 'pointer' }}>
                    Añadir nueva salida del almacén
                </h5>
                <Collapse in={openAdd}>
                    <div id="add-collapse">
                        <div className="form-container">
                            <form onSubmit={handleSubmit} className="text-center">
                                <div className="form-group row justify-content-center">
                                    <label className="col-md-2 col-form-label"><b>Cliente</b></label>
                                    <div className="col-md-4">
                                        <select className="form-control" value={client} onChange={e => setClient(e.target.value)} required>
                                            <option value="">Seleccionar cliente</option>
                                            {clients.map(client => (
                                                <option key={client.id} value={client.id}>
                                                    {client.name}
                                                </option>
                                            ))}
                                        </select>
                                    </div>
                                    <label className="col-md-2 col-form-label"><b>Fecha</b></label>
                                    <div className="col-md-4">
                                        <input 
                                            type="date" 
                                            className="form-control" 
                                            value={date} 
                                            onChange={e => setDate(e.target.value)} 
                                            required 
                                        />
                                    </div>
                                </div>
                                {lines.map((line, index) => (
                                    <div key={index} className="form-group row justify-content-center">
                                        <div className="col-md-4">
                                            <select className="form-control" value={line.article} onChange={e => handleLineChange(index, 'article', e.target.value)} required>
                                                <option value="">Seleccionar artículo</option>
                                                {articles.map(article => (
                                                    <option key={article.id} value={article.id}>
                                                        {article.name}
                                                    </option>
                                                ))}
                                            </select>
                                        </div>
                                        <div className="col-md-3">
                                            <input 
                                                type="number" 
                                                className="form-control" 
                                                placeholder="Cantidad" 
                                                value={line.quantity} 
                                                onChange={e => handleLineChange(index, 'quantity', e.target.value)} 
                                                required 
                                            />
                                        </div>
                                        <div className="col-md-5 d-flex justify-content-center align-items-center">
                                            <button 
                                                className="btn btn-info" 
                                                type="button" 
                                                onClick={addLine} 
                                                title='Añadir otro artículo'
                                            >
                                                <FontAwesomeIcon icon={faPlus} />
                                            </button>
                                            <button 
                                                className="btn btn-danger ml-2" 
                                                type="button" 
                                                onClick={() => removeLine(index)} 
                                                title='Eliminar artículo'
                                            >
                                                <FontAwesomeIcon icon={faMinus} />
                                            </button>
                                        </div>
                                    </div>
                                ))}
                                <div className="form-group row justify-content-center">
                                    <div className="col-md-3">
                                        <button type="submit" className="btn btn-success btn-lg" title='Enviar entrada'>
                                            <FontAwesomeIcon icon={faCircleCheck} />
                                            {loading ? 'Enviando...' : 'Enviar pedido'}
                                        </button>
                                    </div>
                                </div>


                            </form>
                            {successMessage && <p className="success-message text-center">{successMessage}</p>}
                        </div>
                    </div>
                </Collapse>
            </div>
        </div>
    );
};

export default ExitList;
