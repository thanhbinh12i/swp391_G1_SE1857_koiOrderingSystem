﻿using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Data.SqlClient;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;
using Project_SWP391.Dtos.Kois;
using Project_SWP391.Helper;
using Project_SWP391.Interfaces;
using Project_SWP391.Mappers;
using System.Data;

namespace Project_SWP391.Controllers
{
    [Route("api/koi")]
    [ApiController]
    public class KoiController : ControllerBase
    {
        private readonly IKoiRepository _koiRepo;
        private readonly IConfiguration _configuration;
        public KoiController(IKoiRepository koiRepo, IConfiguration configuration)
        {
            _koiRepo = koiRepo;
            _configuration = configuration;
        }

        [HttpGet("view-all")]
        public async Task<IActionResult> GetAll()
        {
            var kois = await _koiRepo.GetAllAsync();

            if (kois == null)
            {
                return NotFound("No koi found!");
            }

            var koiDto = kois.Select(k => k.ToKoiDto());

            return Ok(kois);
        }

        [HttpGet("view-all/paging")]
        public async Task<IActionResult> GetAll([FromQuery] QueryObject query)
        {
            var totalKois = await _koiRepo.CountKoiAsync();
            var kois = await _koiRepo.GetAllAsync(query);
            var koiDto = kois.Select(k => k.ToKoiDto());
            return Ok(new
            {
                items = kois,
                totalCount = totalKois
            });
        }

        [HttpGet("view-by-id/{id}")]
        public async Task<IActionResult> GetById([FromRoute] int id)
        {
            var koi = await _koiRepo.GetByIdAsync(id);

            if (koi == null)
            {
                return NotFound("No koi found!");
            }

            return Ok(koi);
        }

        [HttpGet("view-by-name/{name}")]
        public async Task<IActionResult> GetByName([FromRoute] string name)
        {
            var kois = await _koiRepo.GetByNameAsync(name);

            if (kois == null)
            {
                return NotFound("No koi found!");
            }

            var koiDto = kois.Select(k => k.ToKoiDto());

            return Ok(koiDto);
        }

        [HttpGet("view-by-farm/{farmName}")]
        public async Task<IActionResult> GetByFarmName([FromRoute] string farmName)
        {
            var kois = await _koiRepo.GetByFarmAsync(farmName);

            if (kois == null)
            {
                return NotFound("No koi found!");
            }

            var koiDto = kois.Select(kois => kois.ToKoiDto());

            return Ok(koiDto);
        }

        [HttpGet("view-by-farmId/{farmId}")]
        public async Task<IActionResult> GetByFarmIdName([FromRoute] int farmId)
        {
            var kois = await _koiRepo.GetByFarmIdAsync(farmId);

            if (kois == null)
            {
                return NotFound("No koi found!");
            }

            var koiDto = kois.Select(kois => kois.ToKoiDto());

            return Ok(koiDto);
        }

        [HttpGet("view-by-variety/{varietyName}")]
        public async Task<IActionResult> GetByVarietyName([FromRoute] string varietyName)
        {
            var kois = await _koiRepo.GetByVarietyAsync(varietyName);

            if (kois == null)
            {
                return NotFound("No koi found!");
            }

            var koiDto = kois.Select(kois => kois.ToKoiDto());

            return Ok(koiDto);
        }

        [HttpGet("view-by-variety-id/{varietyId}")]
        public async Task<IActionResult> GetByVarietyIdName([FromRoute] int varietyId)
        {
            var kois = await _koiRepo.GetByVarietyIdAsync(varietyId);

            if (kois == null)
            {
                return NotFound("No koi found!");
            }

            var koiDto = kois.Select(kois => kois.ToKoiDto());

            return Ok(koiDto);
        }

        [HttpGet("view-by-price/{min}-{max}")]
        public async Task<IActionResult> GetByPrice([FromRoute] float min, [FromRoute] float max)
        {
            var kois = await _koiRepo.GetByPriceAsync(min, max);

            if (kois == null)
            {
                return NotFound("No koi found!");
            }

            var koiDto = kois.Select(kois => kois.ToKoiDto());

            return Ok(kois);
        }

        [HttpPost("create/{farmId}")]
        [Authorize(Roles = "Manager")]
        public async Task<IActionResult> Create([FromRoute] int farmId, [FromBody] CreateKoiDto createKoi)
        {
            if (createKoi == null)
            {
                return BadRequest("Koi data is missing");
            }

            var koiModel = createKoi.ToKoiFromCreateDto(farmId);

            await _koiRepo.CreateAsync(koiModel);

            return CreatedAtAction(nameof(GetById), new { id = koiModel.KoiId }, koiModel);
        }

        [HttpPut("update/{koiId}")]
        [Authorize(Roles = "Manager")]
        public async Task<IActionResult> Update([FromRoute] int koiId, [FromBody] UpdateKoiDto updateKoi)
        {
            if (updateKoi == null)
            {
                return BadRequest("Koi data is missing");
            }

            var koiModel = await _koiRepo.UpdateAsync(koiId, updateKoi);

            if (koiModel == null)
            {
                return NotFound();
            }

            return Ok(koiModel);
        }

        [HttpDelete("delete/{koiId}")]
        [Authorize(Roles = "Manager")]
        public async Task<IActionResult> Delete([FromRoute] int koiId)
        {
            var koiModel = await _koiRepo.DeleteAsync(koiId);

            if (koiModel == null)
            {
                return NotFound();
            }

            return NoContent();
        }
        [HttpPost("handle-quantity")]
        public async Task<IActionResult> HandleQuantity(int KoiId, int quantityRequested, string action)
        {

            using (var connection = new SqlConnection(_configuration.GetConnectionString("MyDB")))
            {
                await connection.OpenAsync();
                using (var command = new SqlCommand("HandleQuantity", connection))
                {
                    command.CommandType = CommandType.StoredProcedure;
                    command.Parameters.AddWithValue("@koiId", KoiId);
                    command.Parameters.AddWithValue("@quantityRequested", quantityRequested);
                    command.Parameters.AddWithValue("@action", action);

                    var result = await command.ExecuteScalarAsync();
                    
                    if ((int)result == 0)
                    {
                        return Ok(new { message = action == "cancelOrder" ? "Order cancelled and quantity restored." : "Action performed successfully." });
                    }
                    else
                    {
                        return BadRequest(new { message = "Not enough stock for your request." });
                    }
                }
            }
        }
    }
}
