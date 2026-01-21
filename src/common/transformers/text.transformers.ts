import { TransformFnParams } from 'class-transformer';

export const ToSentenceCase = ({ value }: TransformFnParams) => {
    if (typeof value !== 'string') return value;
    const trimmed = value.trim();
    if (trimmed.length === 0) return trimmed;
    return trimmed.charAt(0).toUpperCase() + trimmed.slice(1).toLowerCase();
};

export const ToLowerCase = ({ value }: TransformFnParams) => {
    if (typeof value !== 'string') return value;
    return value.trim().toLowerCase();
};

export const ToUpperCase = ({ value }: TransformFnParams) => {
    if (typeof value !== 'string') return value;
    return value.trim().toUpperCase();
};

export const Trim = ({ value }: TransformFnParams) => {
    if (typeof value !== 'string') return value;
    return value.trim();
};

export const ToTitleCase = ({ value }: TransformFnParams) => {
    if (typeof value !== 'string') return value;
    const trimmed = value.trim();
    if (trimmed.length === 0) return trimmed;

    // Capitalize first letter of each word
    return trimmed.replace(/\w\S*/g, (txt) => {
        return txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase();
    });
};
