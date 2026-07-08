/*
 * Payment Block
 * Delegates entirely to post-project.js — see that file for why
 * (EDS resolves a block's code by its own class name, so this file has
 * to exist for any page still authored as "Payment", even though the
 * real implementation lives in post-project.js).
 */
export { default } from '../post-project/post-project.js';
