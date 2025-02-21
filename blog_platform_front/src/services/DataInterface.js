
let selected_tags_id = [];

let removed_tags_id = [];


// Intermediario para obtener los tags seleccionados
export function addTag(tag_id) {
    if (!selected_tags_id.includes(tag_id)) {
        selected_tags_id.push(tag_id);
        removed_tags_id = removed_tags_id.filter(tag => tag !== tag_id);
    }
}

export function removeTag(tag_id) {
    selected_tags_id = selected_tags_id.filter(tag => tag !== tag_id);
    if(!removed_tags_id.includes(tag_id)){
        removed_tags_id.push(tag_id);
    }
}

export function getSelectedTags() {
    return selected_tags_id;
}

export function clearSelectedTags() {
    selected_tags_id = [];
}

export function getRemovedTags() {
    return removed_tags_id;
}

export function clearRemovedTags() {
    removed_tags_id = [];
}