import { registerTool, type ToolResult } from './registry';
import { Shopping as ShoppingRepo } from '../repositories';

registerTool({
  name: 'add_shopping',
  description: 'إضافة عنصر لقائمة المشتريات',
  args: [
    { name: 'name', type: 'string', description: 'اسم العنصر', required: true },
    { name: 'quantity', type: 'string', description: 'الكمية', required: false },
  ],
  permission: 'write',
  requiresConfirm: true,
  async execute(args): Promise<ToolResult> {
    const item = await ShoppingRepo.addShoppingItem(args.name, args.quantity);
    return { ok: true, message: `🛒 ضفت "${item.name}" لقائمة المشتريات`, data: { itemId: item.id } };
  },
});

registerTool({
  name: 'list_shopping',
  description: 'عرض قائمة المشتريات',
  args: [],
  permission: 'read',
  requiresConfirm: false,
  async execute(): Promise<ToolResult> {
    const items = await ShoppingRepo.getAllShopping();
    if (items.length === 0) return { ok: true, message: 'القائمة فاضية', data: [] };
    const pending = items.filter(i => !i.checked);
    const done = items.filter(i => i.checked);
    let msg = '';
    if (pending.length > 0) msg += `للشراء (${pending.length}):\n${pending.map(i => `• ${i.name}`).join('\n')}\n`;
    if (done.length > 0) msg += `\nخلصنا (${done.length}):\n${done.map(i => `✓ ${i.name}`).join('\n')}`;
    return { ok: true, message: msg.trim(), data: items };
  },
});
