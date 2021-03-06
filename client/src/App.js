import React, { useState, useEffect } from 'react';
import './App.css';

function App() {

  const [location, setLocation] = React.useState(null);
  const [locations, setLocations] = React.useState([]);
  const [corendonResult, setCorendonResult] = React.useState(null);

  const handleChange = (event) => {
    const name = event.target.value;
    setLocation(name);
    fetch(`http://localhost:4000/filters-corendon/${name}`)
    .then(results => results.json())
    .then(data => {
      setCorendonResult(data);
    });
  };

  useEffect(() => {
    fetch('http://localhost:4000/locations-corendon')
      .then(results => results.json())
      .then(data => {
        const locationsArray = []
        data.map((item) => {
          locationsArray.push({label: item.countryLabel , value: item.countryLabel.toLowerCase()})
        })
        setLocations({
          ...locations,
          corendon: locationsArray
        });
      });

  }, []); 


  return (
    <div className="App">
      <h2 className="text-7xl font-bold mt-20">Tour Operator comparator</h2>
      <h1 className="text-4xl mt-5 text-gray-500">Sunweb vs Corendon</h1>
      <Dropdown
        options={locations.corendon || []}
        value={location}
        onChange={handleChange}
      />
      {corendonResult && corendonResult.map((acco, index) => (
        <div key={index}>{acco.name}  {acco.price}€</div>
      ))}
    </div>
  );
}

const Dropdown = ({ value, options, onChange }) => {
  return (
        <div className="inline-block relative w-64">
          <select className="block appearance-none w-full bg-white border border-gray-400 hover:border-gray-500 px-4 py-2 pr-8 rounded shadow leading-tight focus:outline-none focus:shadow-outline mt-10" value= {value ? value : undefined} onChange={onChange} defaultValue="location">
            <option disabled value="location">Location</option>
            {options.map((option, index) => (
              <option value={option.value} key={index}>{option.label}</option>
            ))}
          </select>
          <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-700 mt-10">
          <svg className="fill-current h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20"><path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z"/></svg>
          </div>
      </div>
  );
};

export default App;
