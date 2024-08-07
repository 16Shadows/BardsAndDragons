module StringUtils {
    export function trim(str: string, ...chars: string[]): string {
        var start = 0, 
            end = str.length;
    
        while(start < end && chars.indexOf(str[start]) >= 0)
            ++start;
    
        while(end > start && chars.indexOf(str[end - 1]) >= 0)
            --end;
    
        return (start > 0 || end < str.length) ? str.substring(start, end) : str;
    }

    export function trimStart(str: string, ...chars: string[]): string {
        var start = 0, 
            end = str.length;
    
        while(start < end && chars.indexOf(str[start]) >= 0)
            ++start;

        return (start > 0 || end < str.length) ? str.substring(start, end) : str;
    }
}

export = StringUtils;