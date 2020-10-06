import React from 'react';

const TestCircle = (props) => (
    <svg className="icon-inline" width="6mm" height="4.5mm" viewBox="0 0 8 6.5" xmlns="http://www.w3.org/2000/svg">
        <ellipse ry="2.1444397" rx="2.1444402" cy="3.2591219" cx="3.984622" id="path1138-2-8"
            style={{ fill: 'none', fillOpacity: 1, stroke: props.color || '#374246', strokeWidth: '1.96674', strokeLinecap: 'round', strokeLinejoin: 'round', strokeMiterlimit: 4, strokeDasharray: 'none', strokeOpacity: 1, stopColor: '#000000' }} />
    </svg>
);

const TestCheckmark = (props) => (
    <svg className="icon-inline" width="6mm" height="4.5mm" viewBox="0 0 8 6.5" xmlns="http://www.w3.org/2000/svg">
        <path d="m 1.1439558,3.2750967 2.400836,2.053452 3.3680103,-4.225565"
            style={{ fill: 'none', stroke: props.color || '#374246', strokeWidth: 2, strokeLinecap: 'round', strokeLinejoin: 'round', strokeMiterlimit: 4, strokeDasharray: 'none', strokeOpacity: 1 }} />
    </svg>
);

export enum TestState {
    Default = 'default',
    Failed = 'failed',
    Completed = 'completed',
}

interface TestProps {
    state: TestState,
    children?: any
}

export const Test: React.FC<TestProps> = (props) => {
    const icon =
        props.state == TestState.Completed ?
            <TestCheckmark color="#39be78" /> :
            <TestCircle color={props.state == TestState.Failed ? '#be5739' : '#374246'} />;

    const className =
        props.state == TestState.Completed ?
            'completed' :
            (props.state == TestState.Failed ? 'failed' : null);

    return (
        <li className={className}>
            {icon}
            <span>{props.children}</span>
        </li>
    );
};

export const TestsList = (props) => (
    <ul className="playground-tests">
        {props.children}
    </ul>
);
