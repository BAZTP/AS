import { describe, it, expect, beforeEach } from 'vitest';
import { storageService } from '../storageService';

describe('storageService - Backup & Export/Import', () => {
  it('debe exportar un objeto de respaldo completo con versión y colecciones', () => {
    const backup = storageService.exportBackup();
    expect(backup.version).toBe('1.0.0');
    expect(Array.isArray(backup.categories)).toBe(true);
    expect(Array.isArray(backup.products)).toBe(true);
    expect(Array.isArray(backup.clients)).toBe(true);
    expect(Array.isArray(backup.quotations)).toBe(true);
    expect(backup.config).toBeDefined();
    expect(backup.config.taxId).toBeDefined();
  });

  it('debe rechazar archivos JSON corruptos o no conformes sin romper los datos', () => {
    const invalidJson = '{"invalido": true}';
    const result = storageService.importBackup(invalidJson);
    expect(result.success).toBe(false);
    expect(result.message).toContain('estructura requerida');
  });

  it('debe rechazar sintaxis JSON rota con mensaje amigable', () => {
    const brokenJson = '{ unclosed json ';
    const result = storageService.importBackup(brokenJson);
    expect(result.success).toBe(false);
    expect(result.message).toContain('Error al procesar');
  });
});
