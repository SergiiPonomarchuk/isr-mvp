"use strict";
function aggregateValues(memberTaxonomies) {
  if (!memberTaxonomies.length) return null;
          const avg_domains = [];
          for (let i = 0; i < 10; i++) {
            let val_sum = 0;
            let rel_sum = 0;
            memberTaxonomies.forEach(mt => {
              const domains_list = mt.taxonomy.domains || [];
              if (domains_list[i] !== undefined && domains_list[i] !== null) {
                val_sum += domains_list[i] * mt.relevance;
                rel_sum += mt.relevance;
              }
            });
            avg_domains.push(rel_sum > 0 ? Math.round(val_sum / rel_sum) : 50);
          }

          const avg_context_shifts = {};
          for (const ctx of ['work', 'family', 'private', 'crisis']) {
            const avg_ctx_list = [];
            for (let i = 0; i < 10; i++) {
              let val_sum = 0;
              let rel_sum = 0;
              memberTaxonomies.forEach(mt => {
                const shifts_dict = mt.taxonomy.contextual_shifts || {};
                const ctx_list = shifts_dict[ctx] || [];
                if (ctx_list[i] !== undefined && ctx_list[i] !== null) {
                  val_sum += ctx_list[i] * mt.relevance;
                  rel_sum += mt.relevance;
                }
              });
              avg_ctx_list.push(rel_sum > 0 ? Math.round(val_sum / rel_sum) : 0);
            }
            avg_context_shifts[ctx] = avg_ctx_list;
          }

          const avg_items = {};
          for (let i = 1; i <= 10; i++) {
            const key = `d${i}`;
            let items_len = 0;
            for (let mt of memberTaxonomies) {
              const items_dict = mt.taxonomy.items || {};
              if (items_dict[key] && items_dict[key].length > 0) {
                items_len = items_dict[key].length;
                break;
              }
            }
            if (items_len > 0) {
              const avg_item_list = [];
              for (let j = 0; j < items_len; j++) {
                let val_sum = 0;
                let rel_sum = 0;
                memberTaxonomies.forEach(mt => {
                  const items_dict = mt.taxonomy.items || {};
                  const item_list = items_dict[key] || [];
                  if (item_list[j] !== undefined && item_list[j] !== null) {
                    val_sum += item_list[j] * mt.relevance;
                    rel_sum += mt.relevance;
                  }
                });
                avg_item_list.push(rel_sum > 0 ? Math.round(val_sum / rel_sum) : 50);
              }
              avg_items[key] = avg_item_list;
            } else {
              avg_items[key] = [];
            }
          }

          const avg_conflict_resolution = [];
          for (let i = 0; i < 36; i++) {
            let val_sum = 0;
            let rel_sum = 0;
            memberTaxonomies.forEach(mt => {
              const conflicts_list = mt.taxonomy.conflict_resolution || [];
              let val = null;
              if (conflicts_list[i] !== undefined && conflicts_list[i] !== null) {
                if (typeof conflicts_list[i] === 'object') {
                  val = conflicts_list[i].weight;
                } else {
                  val = conflicts_list[i];
                }
              }
              if (val !== null) {
                val_sum += val * mt.relevance;
                rel_sum += mt.relevance;
              }
            });
            avg_conflict_resolution.push(rel_sum > 0 ? Math.round(val_sum / rel_sum) : 50);
          }

          return {
            domains: avg_domains,
            items: avg_items,
            contextual_shifts: avg_context_shifts,
            conflict_resolution: avg_conflict_resolution
          };
}
module.exports = { aggregateValues };
