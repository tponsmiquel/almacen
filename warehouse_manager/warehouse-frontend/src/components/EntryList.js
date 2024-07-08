import React, { useEffect, useState, useCallback } from 'react';
import { getEntries, createEntry, getArticles } from '../services/api';
import { Collapse } from 'react-bootstrap';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faSearch, faSyncAlt, faPlus, faMinus, faCircleCheck } from '@fortawesome/free-solid-svg-icons';

const EntryList = () => {
    const [entries, setEntries] = useState([]);
    const [filteredEntries, setFilteredEntries] = useState([]);
    const [articles, setArticles] = useState([]);
    const [date, setDate] = useState('');
    const [lines, setLines] = useState([{ article: '', quantity: '' }]);
    const [filterArticle, setFilterArticle] = useState('');
    const [filterStartDate, setFilterStartDate] = useState('');
    const [filterEndDate, setFilterEndDate] = useState('');
    const [successMessage, setSuccessMessage] = useState('');
    const [openSearch, setOpenSearch] = useState(false);
    const [openAdd, setOpenAdd] = useState(false);

    useEffect(() => {
        fetchEntries();
        fetchArticles();
    }, []);

    const fetchEntries = async () => {
        try {
            const response = await getEntries();
            console.log("Entries: ", response.data);
            setEntries(response.data || []);
        } catch (error) {
            console.error('Error fetching entries:', error);
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

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            for (const line of lines) {
                const entryData = { article: line.article, quantity: line.quantity, date };
                console.log('Enviando datos de entrada:', entryData); // Registro de depuración
                await createEntry(entryData);
            }
            setSuccessMessage('Entradas añadidas con éxito.');
            // Limpiar los campos del formulario
            setDate('');
            setLines([{ article: '', quantity: '' }]);
            // Ocultar el mensaje de éxito después de 3 segundos
            setTimeout(() => {
                setSuccessMessage('');
            }, 3000);
            fetchEntries(); // Actualizar la lista de entradas después de agregar una nueva
        } catch (error) {
            console.error('Error creando la entrada:', error.response.data); // Registro de depuración
        }
    };

    const handleFilter = useCallback(() => {
        let filtered = entries;

        if (filterArticle) {
            filtered = filtered.filter(entry => {
                const article = articles.find(a => a.id === entry.article);
                return article && article.name === filterArticle;
            });
        }

        if (filterStartDate && filterEndDate) {
            filtered = filtered.filter(entry => entry.date >= filterStartDate && entry.date <= filterEndDate);
        }

        setFilteredEntries(filtered);
    }, [entries, articles, filterArticle, filterStartDate, filterEndDate]);

    const resetFilters = () => {
        setFilterArticle('');
        setFilterStartDate('');
        setFilterEndDate('');
        setFilteredEntries([]);
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
                    style={{ cursor: 'pointer' }}>
                    Buscador de entradas en almacén
                </h5>
                <Collapse in={openSearch}>
                    <div id="search-collapse">
                        <div className="filters-container row justify-content-center">
                            <div className="col-md-4">
                                <select className="form-control" value={filterArticle} onChange={e => setFilterArticle(e.target.value)}>
                                    <option value="">Seleccionar artículo</option>
                                    {articles.map(article => (
                                        <option key={article.id} value={article.name}>
                                            {article.name}
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
                                    <FontAwesomeIcon icon={faSearch} />
                                </button>
                                <button className="btn btn-secondary ml-2" onClick={resetFilters} title='Resetear campos'>
                                    <FontAwesomeIcon icon={faSyncAlt} />
                                </button>
                            </div>
                        </div>
                        {filteredEntries.length > 0 && (
                            <table className="styled-table table table-striped mt-4">
                                <thead>
                                    <tr>
                                        <th>Artículo</th>
                                        <th>Cantidad</th>
                                        <th>Fecha</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {filteredEntries.map(entry => (
                                        <tr key={entry.id}>
                                            <td>{articles.find(a => a.id === entry.article)?.name || 'Desconocido'}</td>
                                            <td>{entry.quantity}</td>
                                            <td>{entry.date}</td>
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
                    style={{ cursor: 'pointer' }}>
                    Añadir nueva entrada en almacén
                </h5>
                <Collapse in={openAdd}>
                    <div id="add-collapse">
                        <div className="form-container">
                            <form onSubmit={handleSubmit} className="text-center">
                                <div className="form-group row justify-content-center">
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
                                    <div key={index} className="form-group row justify-content-center align-items-center">
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
                                        <button className="btn btn-info" onClick={addLine} type="button" title='Añadir otro artículo'>
                                            <FontAwesomeIcon icon={faPlus} />
                                        </button>
                                        <button className="btn btn-danger" onClick={() => removeLine(index)} type="button" title='Eliminar artículo'>
                                            <FontAwesomeIcon icon={faMinus} />
                                        </button>
                                    </div>
                                </div>
                                ))}
                                <div className="form-group row justify-content-center">
                                    <div className="col-md-3">
                                        <button type="submit" className="btn btn-success btn-lg" title='Enviar entrada'>
                                            <FontAwesomeIcon icon={faCircleCheck} /> Enviar entrada
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

export default EntryList;
