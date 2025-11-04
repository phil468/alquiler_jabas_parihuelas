<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

class Cliente extends Model
{
    use HasFactory, SoftDeletes;

    protected $fillable = [
        'codigo',
        'nombre',
        'ruc',
        'direccion',
        'telefono',
        'email',
        'activo',
    ];

    protected $casts = [
        'activo' => 'boolean',
    ];

    // Relación con registros
    public function registros()
    {
        return $this->hasMany(Registro::class);
    }

    // Scope para clientes activos
    public function scopeActivos($query)
    {
        return $query->where('activo', true);
    }
}
