DELETE FROM country
WHERE name NOT IN (
    -- AMÉRICA (Norte, Sur, Central y Caribe - Se mantienen todos los listados)
    'United States', 'Canada', 'Mexico', 'Brazil', 'Argentina', 'Chile', 
    'Colombia', 'Peru', 'Venezuela', 'Uruguay', 'Paraguay', 'Bolivia', 
    'Ecuador', 'Guatemala', 'Cuba', 'Haiti', 'Dominican Republic', 'Honduras', 
    'El Salvador', 'Nicaragua', 'Costa Rica', 'Panama', 'Jamaica', 
    'Trinidad And Tobago', 'Belize', 'Guyana', 'Suriname', 'French Guiana', 
    'Puerto Rico', 'Guadeloupe', 'Martinique', 'Bahamas The', 'Barbados', 
    'Saint Lucia', 'Curaçao', 'Aruba', 'Bermuda', 'Greenland', 'Antigua And Barbuda',
    'Saint Kitts And Nevis', 'Dominica', 'Grenada', 'Saint Vincent And The Grenadines',
    'Turks And Caicos Islands', 'Cayman Islands', 'Virgin Islands (US)', 
    'Virgin Islands (British)', 'Falkland Islands', 'Anguilla', 
    'Saint Pierre and Miquelon', 'Montserrat', 'Saint-Barthelemy', 'Saint-Martin (French part)',
    'Sint Maarten (Dutch part)', 'Bonaire, Sint Eustatius and Saba',

    -- EUROPA (Se mantienen todos los listados)
    'Germany', 'United Kingdom', 'France', 'Italy', 'Spain', 'Ukraine', 'Poland', 
    'Romania', 'Netherlands The', 'Belgium', 'Czech Republic', 'Greece', 'Portugal', 
    'Sweden', 'Hungary', 'Belarus', 'Austria', 'Serbia', 'Switzerland', 'Bulgaria', 
    'Denmark', 'Finland', 'Slovakia', 'Norway', 'Ireland', 'Croatia (Hrvatska)', 
    'Moldova', 'Bosnia and Herzegovina', 'Albania', 'Lithuania', 'Macedonia', 
    'Slovenia', 'Latvia', 'Estonia', 'Montenegro', 'Luxembourg', 'Malta', 'Iceland', 
    'Andorra', 'Monaco', 'Liechtenstein', 'San Marino', 'Vatican City State (Holy See)', 
    'Russia', 'Jersey', 'Gibraltar', 'Man (Isle of)', 'Faroe Islands', 
    'Svalbard And Jan Mayen Islands', 'Guernsey and Alderney', 'Aland Islands',

    -- ÁFRICA (Solo los más conocidos geopolítica o turísticamente)
    'Egypt', 'South Africa', 'Nigeria', 'Morocco', 'Kenya', 'Ethiopia', 'Ghana', 
    'Algeria', 'Tunisia', 'Senegal', 'Cameroon', 'Cote D''Ivoire (Ivory Coast)', 
    'Tanzania', 'Madagascar', 'Angola', 'Uganda'
    
    -- NOTA: Turquía y Chipre a veces se consideran Europa/Asia. 
    -- Los he excluido abajo (eliminado) o incluido aquí según convención europea habitual:
    , 'Turkey', 'Cyprus'
);
