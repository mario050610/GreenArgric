import { Router } from 'express';
import { store, nextId } from '../data/store.js';
import { persistAllThresholds, persistArea, updatePersistedArea } from '../db.js';
import { allowRoles } from '../middleware/auth.js';
const router = Router();

const normalizeHealth = (currentValue, fallback = 100) => {
  const current = Number(currentValue);
  return Number.isFinite(current) ? Math.max(0, Math.min(100, current)) : fallback;
};
const statusForHealth = (health) => health >= 80 ? 'good' : health >= 65 ? 'warning' : 'danger';

router.get('/', (req,res)=>res.json(store.areas));
router.post('/', allowRoles('admin','owner'), async (req,res)=>{ const healthScore=normalizeHealth(req.body.health_score); const uiStatus=statusForHealth(healthScore); const item={ area_id:nextId(store.areas,'area_id'), owner_id:req.user.role==='owner'?req.user.id:Number(req.body.owner_id||req.user.id), area_name:String(req.body.area_name||'').trim(), location:String(req.body.location||'').trim(), crop_type:String(req.body.crop_type||'').trim(), description:String(req.body.description||'').trim(), status:uiStatus==='good'?'active':'maintenance', ui_status:uiStatus, health_score:healthScore, planted_date:String(req.body.planted_date||'Mới tạo'), harvest_date:String(req.body.harvest_date||'Chưa xác định') }; if(!item.area_name||!item.crop_type)return res.status(400).json({message:'Tên khu vực và loại cây là bắt buộc'}); if(store.areas.some(area=>area.area_name.toLowerCase()===item.area_name.toLowerCase()))return res.status(409).json({message:'Tên khu vực đã tồn tại'}); await persistArea(item); store.areas.push(item); const template=store.thresholds.filter(x=>x.area_id===1); for(const row of template)store.thresholds.push({...row,threshold_id:nextId(store.thresholds,'threshold_id'),area_id:item.area_id}); await persistAllThresholds(); res.status(201).json(item); });
router.put('/:id', allowRoles('admin','owner'), async (req,res)=>{ const item=store.areas.find(x=>x.area_id===Number(req.params.id)); if(!item)return res.status(404).json({message:'Không tìm thấy khu vực'}); if(req.user.role==='owner'&&item.owner_id!==req.user.id)return res.status(403).json({message:'Bạn chỉ có thể sửa khu vực của mình'}); const healthScore=normalizeHealth(req.body.health_score,item.health_score??100); const uiStatus=statusForHealth(healthScore); Object.assign(item,req.body,{area_id:item.area_id,owner_id:item.owner_id,status:uiStatus==='good'?'active':'maintenance',ui_status:uiStatus,health_score:healthScore}); await updatePersistedArea(item); res.json(item); });
router.delete('/:id', allowRoles('admin'), (req,res)=>{ const id=Number(req.params.id); if(store.sensors.some(x=>x.area_id===id)||store.devices.some(x=>x.area_id===id))return res.status(409).json({message:'Khu vực còn cảm biến hoặc thiết bị đang gán'}); const index=store.areas.findIndex(x=>x.area_id===id); if(index<0)return res.status(404).json({message:'Không tìm thấy khu vực'}); store.areas.splice(index,1); res.json({message:'Xóa khu vực thành công'}); });
export default router;
