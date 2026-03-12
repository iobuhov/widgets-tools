import { ReactElement } from "react";

export interface TestCheckboxProps {
    checked: boolean;
    label: string;
    onChange?: () => void;
}

export function TestCheckbox(props: TestCheckboxProps): ReactElement {
    return (
        <div className="test-checkbox-container">
            <label>
                <input type="checkbox" checked={props.checked} onChange={props.onChange} />
                <span>{props.label}</span>
            </label>
        </div>
    );
}
