/**
 * Utility to merge class names — lightweight alternative to clsx/cn.
 * Filters out falsy values and joins the rest with a space.
 */
export function cn(...classes) {
    return classes.filter(Boolean).join(' ');
}
