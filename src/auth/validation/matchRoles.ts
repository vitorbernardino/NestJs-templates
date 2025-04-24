export function matchRoles(allowedRoles: string[], userRoles: string[]): boolean {
    if (!allowedRoles || allowedRoles.length === 0) {
        return true; 
    }
    
    if (!userRoles || userRoles.length === 0) {
        return false; 
    }
    
    return allowedRoles.some(role => userRoles.includes(role));
}