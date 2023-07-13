import React from 'react';
import { Button } from 'reactstrap';

const RowButtonComponent = (props) => {
    const { data, onClick, className, name, iconClassName, label } = props;

    var handleClick = () => {
        onClick(data);
    }

    return (
        <Button className={className} name={name} onClick={handleClick}><i className={iconClassName}></i>{label}</Button>
    );
}

export default RowButtonComponent;