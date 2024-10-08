﻿using Project_SWP391.Dtos.KoiVariable;
using Project_SWP391.Model;

namespace Project_SWP391.Interfaces
{
    public interface IKoiVarietyRepository
    {
        Task<List<KoiVariety>> GetAllAsync();
        Task<KoiVariety?> GetByIdAsync(int id);
        Task<KoiVariety> CreateAsync(KoiVariety variety);
        Task<KoiVariety> UpdateAsync(int id, UpdateKoiVarietyDto variety);
        Task<KoiVariety> DeleteAsync(int id);
    }
}
